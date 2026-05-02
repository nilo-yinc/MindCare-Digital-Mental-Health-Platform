const { GoogleGenerativeAI } = require('@google/generative-ai');
const GlobalChatHistory = require('../models/GlobalChatHistory');
const UserDigitalTwin = require('../models/UserDigitalTwin');

// Multi-key support — try all available Gemini keys
function getGenAIClients() {
  const clients = [];
  const key1 = (process.env.GEMINI_API_KEY || '').trim();
  const key2 = (process.env.GEMINI_API_KEY_2 || '').trim();
  if (key1) clients.push(new GoogleGenerativeAI(key1));
  if (key2) clients.push(new GoogleGenerativeAI(key2));
  return clients;
}

/**
 * TwinService — Background Digital Twin Trainer
 * 
 * Runs AFTER every chat response (non-blocking).
 * Analyzes the last 10 messages for recurring themes,
 * updates the UserDigitalTwin schema silently.
 * 
 * The user NEVER sees this data directly.
 * It only influences: AI persona, suggested actions, admin heatmaps.
 */

const ANALYSIS_PROMPT = `You are a clinical psychology analyst. Analyze these chat messages from a student.

Return ONLY valid JSON (no markdown, no backticks):
{
  "moodScore": 0.0-1.0 (0=very negative, 1=very positive),
  "dominantEmotion": "Anxious|Sad|Stressed|Lonely|Hopeful|Calm|Neutral|Overwhelmed",
  "identifiedStressors": ["Exam Stress", "Sleep Deprivation", "Loneliness", "Academic Pressure", "Financial Worry", "Relationship Issues", "Self-Doubt"],
  "riskScore": 0.0-1.0 (0=no risk, 1=immediate danger),
  "summary": "One-line clinical summary"
}

Only include stressors that are actually present. Be accurate.`;

/**
 * Train the Digital Twin profile from recent chat history.
 * Called asynchronously after every chat interaction.
 */
async function trainProfile(userId) {
  try {
    // Fetch last 10 user messages from global history
    const recentMessages = await GlobalChatHistory.find({
      user: userId,
      role: 'user'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (recentMessages.length < 2) return; // Need at least 2 messages to analyze

    const messagesText = recentMessages
      .map((m, i) => `[${i + 1}] ${m.content}`)
      .join('\n');

    // Use fast model for background analysis
    // Use fast model for background analysis — try all keys
    const clients = getGenAIClients();
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let text = null;
    for (const client of clients) {
      for (const modelName of modelsToTry) {
        try {
          const model = client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(
            `${ANALYSIS_PROMPT}\n\nMessages:\n${messagesText}`
          );
          text = result.response.text();
          if (text && text.trim()) break;
        } catch (err) {
          console.warn(`[TWIN] ${modelName} failed: ${err.message?.slice(0, 80)}`);
          continue;
        }
      }
      if (text && text.trim()) break;
    }

    if (!text) return; // All keys exhausted, skip this cycle

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const analysis = JSON.parse(jsonMatch[0]);

    // Upsert the Digital Twin
    let twin = await UserDigitalTwin.findOne({ user: userId });
    if (!twin) {
      twin = new UserDigitalTwin({ user: userId });
    }

    // Append sentiment score (keep rolling window of 20)
    twin.sentimentScores.push({
      score: analysis.moodScore,
      emotion: analysis.dominantEmotion,
      analyzedAt: new Date()
    });
    if (twin.sentimentScores.length > 20) {
      twin.sentimentScores = twin.sentimentScores.slice(-20);
    }

    // Update stressors (merge, don't replace)
    for (const stressor of (analysis.identifiedStressors || [])) {
      const existing = twin.identifiedStressors.find(
        s => s.theme.toLowerCase() === stressor.toLowerCase()
      );
      if (existing) {
        existing.frequency += 1;
        existing.lastDetected = new Date();
      } else {
        twin.identifiedStressors.push({
          theme: stressor,
          frequency: 1,
          firstDetected: new Date(),
          lastDetected: new Date()
        });
      }
    }

    // Calculate composite stress score
    // S = (Weight * Mood) + (Weight * ExamProximity)
    // Formula per requirement: S = (0.4 * (1 - Mavg)) + (0.4 * Afreq) + (0.2 * Eproxy)
    const recentScores = twin.sentimentScores.slice(-7);
    const Mavg = recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
      : 0.5;

    const Afreq = Math.min(twin.identifiedStressors.length / 5, 1); // Normalize stressors
    const Eproxy = (analysis.identifiedStressors || [])
      .some(s => s.toLowerCase().includes('exam') || s.toLowerCase().includes('academic')) ? 0.9 : 0.1;

    // Principal AI Math: S = (0.5 * (1 - Mavg)) + (0.3 * Afreq) + (0.2 * Eproxy)
    const S = (0.5 * (1 - Mavg)) + (0.3 * Afreq) + (0.2 * Eproxy);

    twin.overallStressScore = Math.round(S * 100) / 100;
    twin.dominantMoodState = analysis.dominantEmotion;
    twin.riskLevel = S > 0.75 ? 'Critical' : S > 0.6 ? 'High' : S > 0.4 ? 'Moderate' : 'Low';
    twin.lastAnalyzedAt = new Date();
    twin.totalInteractions = (twin.totalInteractions || 0) + 1;

    await twin.save();

    // ── Update Department Heatmap (Institutional Reporting) ──────────────────
    try {
      const DepartmentHeatmap = require('../models/DepartmentHeatmap');
      const dept = twin.department || 'General';
      
      await DepartmentHeatmap.findOneAndUpdate(
        { department: dept },
        { 
          $inc: { 
            totalAnalyses: 1,
            [`stressDistribution.${twin.riskLevel.toLowerCase()}`]: 1
          },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    } catch (heatmapErr) {
      console.error('[TWIN] Heatmap update failed:', heatmapErr.message);
    }

    console.log(`[TWIN] Profile updated for user ${userId} | Stress: ${twin.overallStressScore} | Risk: ${twin.riskLevel}`);
  } catch (err) {
    // Non-blocking — never crash the server
    console.error('[TWIN] Background training failed:', err.message);
  }
}

/**
 * Get the current Digital Twin profile for a user.
 */
async function getProfile(userId) {
  let twin = await UserDigitalTwin.findOne({ user: userId }).lean();
  if (!twin) {
    twin = {
      overallStressScore: 0.3,
      dominantMoodState: 'Neutral',
      riskLevel: 'Low',
      identifiedStressors: [],
      sentimentScores: [],
      totalInteractions: 0
    };
  }
  return twin;
}

module.exports = { trainProfile, getProfile };
