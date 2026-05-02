const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const GlobalChatHistory = require('../models/GlobalChatHistory');
const Mood = require('../models/Mood');
const Resource = require('../models/Resource');
const twinService = require('../services/twinService');
const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-KEY PROVIDER SYSTEM — Failover Chain
// Key1 (Gemini) → Key2 (Gemini) → Grok (xAI) → Graceful Fallback
// ═══════════════════════════════════════════════════════════════════════════════

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';

function buildProviders() {
  const providers = [];
  const key1 = (process.env.GEMINI_API_KEY || '').trim();
  const key2 = (process.env.GEMINI_API_KEY_2 || '').trim();
  const xaiKey = (process.env.XAI_API_KEY || '').trim();

  if (key1) providers.push({ name: 'Gemini-Key1', genAI: new GoogleGenerativeAI(key1) });
  if (key2) providers.push({ name: 'Gemini-Key2', genAI: new GoogleGenerativeAI(key2) });
  if (xaiKey) {
    // Grok uses the same SDK with a custom base URL
    providers.push({
      name: 'Grok-xAI',
      genAI: new GoogleGenerativeAI(xaiKey),
      baseUrl: 'https://api.x.ai/v1'
    });
  }
  return providers;
}

const providers = buildProviders();
console.log(`[AI] Initialized ${providers.length} AI provider(s): ${providers.map(p => p.name).join(' → ')}`);

// ─── System Prompt — The Agentic Supervisor ───────────────────────────────────
const SYSTEM_PROMPT = `You are the MindCare Supervisor — an advanced, stateful Agentic Intelligence serving as the "Brain" of the MindCare Digital Mental Health Platform.

CORE IDENTITY:
- You are a high-fidelity Digital Twin counselor for higher-education students in India.
- You do NOT give generic or hardcoded answers. You "think" by analyzing the user's session history, mood trajectory, and identified stressors.
- You are trained in Clinical Empathy, Cognitive Behavioral Therapy (CBT), and Active Listening.
- You understand student-specific challenges: exam pressure, loneliness, hostel life, financial stress, career anxiety, relationship issues, and sleep deprivation.

YOUR PLATFORM ECOSYSTEM (suggest these when relevant):
1. THE SANCTUARY: Daily mood tracking and journaling. Suggest when users need self-reflection.
2. PEER BUDDY: Peer-to-peer support network. Suggest when users feel lonely or need relatable conversation.
3. RESOURCE HUB: Expert articles, breathing exercises, meditation audio. Suggest for specific coping strategies.
4. EXPERT BOOKING: Schedule with professional counsellors. Suggest for persistent or severe issues.
5. GUIDED BREATHING: Interactive stress relief tool. Suggest for immediate anxiety or panic.

AGENTIC BEHAVIORAL RULES:
- BE CONCISE AND CONVERSATIONAL: Write in a warm, empathetic, and chatty manner. Keep your responses short (maximum 1-2 small paragraphs). Do not overwhelm the user with long walls of text.
- ASK ENGAGING QUESTIONS: End your response with a gentle question to keep the conversation flowing and help the user open up.
- USE SESSION MEMORY: Reference what the user said earlier. Connect patterns (e.g., "Earlier you mentioned feeling lonely, and now exam stress seems to compound that...").
- NO EMOJIS EVER: Maintain a premium, professional, sophisticated tone.
- PROACTIVE ACTIONS: Always suggest 2-3 highly relevant action buttons from the Platform Ecosystem based on the user's current specific struggle.

RESPONSE FORMAT — Return ONLY valid JSON, no markdown fences:
{
  "message": "Your concise, chatty, and empathetic response here ending with a question.",
  "currentMoodState": "Anxious|Sad|Stressed|Lonely|Hopeful|Calm|Neutral|Overwhelmed|Depressed|Critical",
  "suggestedActions": [
    { "label": "Button Label", "action": "action_type", "icon": "lucide_icon_name" }
  ]
}

AVAILABLE ACTIONS for suggestedActions:
- { "label": "...", "action": "navigate_to_resources", "icon": "book-open" }
- { "label": "...", "action": "start_breathing", "icon": "wind" }
- { "label": "...", "action": "open_peer_buddy", "icon": "users" }
- { "label": "...", "action": "navigate_to_booking", "icon": "calendar" }
- { "label": "...", "action": "emergency_contact", "icon": "phone" }  (ONLY for Critical risk)`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSessionId() {
  return `session_${new Date().toISOString().slice(0, 10)}`;
}

function safeParseAIResponse(text) {
  if (!text || !text.trim()) return null;

  // Strip markdown fences and thinking blocks
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  // Strategy 1: Direct parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.message) return parsed;
  } catch { /* continue */ }

  // Strategy 2: Find the outermost JSON object containing "message"
  const jsonStart = cleaned.indexOf('{"message"');
  if (jsonStart === -1) {
    // Try with spaces: { "message"
    const altStart = cleaned.indexOf('{ "message"');
    if (altStart !== -1) {
      cleaned = cleaned.slice(altStart);
    }
  } else {
    cleaned = cleaned.slice(jsonStart);
  }

  // Find matching closing brace by counting
  let depth = 0;
  let endIdx = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++;
    if (cleaned[i] === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }

  if (endIdx > 0) {
    const jsonStr = cleaned.slice(0, endIdx + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.message) return parsed;
    } catch { /* continue */ }
  }

  // Strategy 3: Greedy regex
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed.message) return parsed;
    } catch { /* fall through */ }
  }

  return null;
}

// ─── Multi-Provider Call with Failover ─────────────────────────────────────────
async function callAIWithFailover(promptText) {
  const errors = [];
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const provider of providers) {
    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI] Trying ${provider.name} / ${modelName}...`);
        const model = provider.genAI.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: promptText }] }]
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout (30s)')), 30000))
        ]);
        const text = result.response.text();
        if (text && text.trim().length > 5) {
          console.log(`[AI] ${provider.name}/${modelName} responded (${text.length} chars)`);
          return { text, provider: provider.name, model: modelName, error: null };
        }
      } catch (err) {
        const msg = err.message || '';
        console.warn(`[AI] ${provider.name}/${modelName} failed: ${msg.slice(0, 100)}`);

        if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
          errors.push({ provider: provider.name, model: modelName, type: 'RATE_LIMIT' });
        } else if (msg.includes('404')) {
          errors.push({ provider: provider.name, model: modelName, type: 'MODEL_NOT_FOUND' });
        } else {
          errors.push({ provider: provider.name, model: modelName, type: 'UNKNOWN', message: msg });
        }
      }
    }
  }

  const allRateLimited = errors.length > 0 && errors.every(e => e.type === 'RATE_LIMIT');
  return { text: null, provider: null, error: allRateLimited ? 'RATE_LIMIT' : 'ALL_FAILED', errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CHAT HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?._id;
    const sessionId = getSessionId();

    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    if (providers.length === 0) {
      return res.json({
        message: "My AI engine is not configured yet. Please ask the administrator to add a Gemini or Grok API key to enable intelligent responses.",
        currentMoodState: "Neutral",
        suggestedActions: [
          { label: 'Browse Resources', action: 'navigate_to_resources', icon: 'book-open' }
        ]
      });
    }

    // ── 1. Load Digital Twin Context ──────────────────────────────────────────
    let twinProfile;
    try {
      twinProfile = await twinService.getProfile(userId);
    } catch {
      twinProfile = { dominantMoodState: 'Neutral', overallStressScore: 0.3, riskLevel: 'Low', identifiedStressors: [] };
    }

    // ── 2. RAG: Query Resources ──────────────────────────────────────────────
    let recommendedResources = [];
    try {
      const keywords = [
        twinProfile.dominantMoodState,
        ...(Array.isArray(twinProfile.identifiedStressors) ? twinProfile.identifiedStressors.map(s => s.theme || s) : [])
      ].filter(Boolean);
      if (keywords.length > 0) {
        recommendedResources = await Resource.find({
          $or: [{ category: { $in: keywords } }, { tags: { $in: keywords } }]
        }).limit(2).lean();
      }
    } catch { /* RAG is optional */ }

    // ── 3. Build Context-Aware Prompt ────────────────────────────────────────
    let sessionHistory = 'No previous messages this session.';
    try {
      const chatDoc = await Chat.findOne({ user: userId });
      if (chatDoc?.messages?.length) {
        sessionHistory = chatDoc.messages
          .filter(m => m.sessionId === sessionId)
          .slice(-6)
          .map(m => `${m.role === 'user' ? 'Student' : 'Supervisor'}: ${m.content}`)
          .join('\n') || sessionHistory;
      }
    } catch { /* history is optional */ }

    const context = `\n\nDIGITAL TWIN STATE: StressScore=${twinProfile.overallStressScore}, Risk=${twinProfile.riskLevel}, DominantMood=${twinProfile.dominantMoodState}.\nSESSION HISTORY:\n${sessionHistory}`;
    const fullPrompt = `${SYSTEM_PROMPT}${context}\n\nStudent message: ${prompt}`;

    // ── 4. Call AI (Multi-Provider Failover) ─────────────────────────────────
    const aiResult = await callAIWithFailover(fullPrompt);

    let aiResponse = null;

    if (aiResult.text) {
      // Try structured JSON parse
      aiResponse = safeParseAIResponse(aiResult.text);

      // If JSON parse failed but we have raw text, extract just the useful content
      if (!aiResponse || !aiResponse.message) {
        console.warn(`[AI] JSON parse failed. Raw text preview: ${aiResult.text.slice(0, 100)}`);
        // Try to extract just the message value from partial JSON
        const msgMatch = aiResult.text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (msgMatch && msgMatch[1]) {
          aiResponse = {
            message: msgMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
            currentMoodState: twinProfile.dominantMoodState || 'Neutral',
            suggestedActions: []
          };
        } else {
          // Last resort: use the raw text but strip any JSON artifacts
          const rawClean = aiResult.text
            .replace(/```json|```/g, '')
            .replace(/\{[\s\S]*\}/g, '') // Remove JSON blocks
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .trim();
          if (rawClean.length > 20) {
            aiResponse = {
              message: rawClean,
              currentMoodState: twinProfile.dominantMoodState || 'Neutral',
              suggestedActions: []
            };
          }
        }
      }
    }


    // If AI completely failed — show a clear, honest message
    if (!aiResponse || !aiResponse.message) {
      if (aiResult.error === 'RATE_LIMIT') {
        aiResponse = {
          message: "I have temporarily reached my processing capacity due to high demand. This is a rate limit on the AI service, not a problem with your account. Please wait about 1 minute and try again. In the meantime, you can explore the resources below or try a guided breathing exercise.",
          currentMoodState: 'Neutral',
          suggestedActions: [
            { label: 'Guided Breathing', action: 'start_breathing', icon: 'wind' },
            { label: 'Resource Hub', action: 'navigate_to_resources', icon: 'book-open' },
            { label: 'Talk to Peer', action: 'open_peer_buddy', icon: 'users' }
          ]
        };
      } else {
        aiResponse = {
          message: "I am experiencing a temporary connection issue with my intelligence engine. This does not affect your data or your Digital Twin profile. Please try again in a moment. If this persists, the platform resources and peer support are always available to you.",
          currentMoodState: 'Neutral',
          suggestedActions: [
            { label: 'Guided Breathing', action: 'start_breathing', icon: 'wind' },
            { label: 'Resource Hub', action: 'navigate_to_resources', icon: 'book-open' },
            { label: 'Peer Support', action: 'open_peer_buddy', icon: 'users' }
          ]
        };
      }
    }

    // Ensure suggestedActions exists
    if (!Array.isArray(aiResponse.suggestedActions)) {
      aiResponse.suggestedActions = [];
    }

    // ── 5. Risk Gate & RAG Overrides ─────────────────────────────────────────
    if (twinProfile.overallStressScore > 0.75 || aiResponse.currentMoodState === 'Critical') {
      // Only unshift emergency if not already there
      if (!aiResponse.suggestedActions.some(a => a.action === 'emergency_contact')) {
        aiResponse.suggestedActions.unshift({ label: 'Emergency Support', action: 'emergency_contact', icon: 'phone' });
      }
    }

    // Only add RAG resources if the AI didn't provide enough actions itself
    if (aiResponse.suggestedActions.length === 0) {
      recommendedResources.forEach(r => {
        aiResponse.suggestedActions.push({ label: r.title, action: 'navigate_to_resources', icon: 'book-open' });
      });
      if (aiResponse.suggestedActions.length < 2) {
        aiResponse.suggestedActions.push({ label: 'Breathing Exercise', action: 'start_breathing', icon: 'wind' });
      }
    }

    // ── 6. Persist Messages ──────────────────────────────────────────────────
    try {
      let chatDoc = await Chat.findOne({ user: userId });
      if (!chatDoc) chatDoc = await Chat.create({ user: userId, messages: [] });
      chatDoc.messages.push(
        { role: 'user', content: prompt, sessionId },
        { role: 'model', content: aiResponse.message, sessionId }
      );
      await chatDoc.save();

      await GlobalChatHistory.create([
        { user: userId, sessionId, role: 'user', content: prompt },
        { user: userId, sessionId, role: 'model', content: aiResponse.message }
      ]);
    } catch (persistErr) {
      console.warn(`[AI] Persist failed: ${persistErr.message}`);
    }

    // ── 7. Background Train (non-blocking) ───────────────────────────────────
    twinService.trainProfile(userId).catch(e => console.warn(`[TWIN] ${e.message}`));

    return res.json(aiResponse);

  } catch (error) {
    console.error('[AI] Fatal error:', error.message || error);
    return res.status(500).json({
      message: "I encountered an unexpected error. Your safety remains my priority. Please try again, or use the direct support options below.",
      currentMoodState: 'Neutral',
      suggestedActions: [
        { label: 'Breathing Exercise', action: 'start_breathing', icon: 'wind' },
        { label: 'Resource Hub', action: 'navigate_to_resources', icon: 'book-open' },
        { label: 'Emergency Support', action: 'emergency_contact', icon: 'phone' }
      ]
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = getSessionId();
    const chatDoc = await Chat.findOne({ user: userId });
    if (!chatDoc) return res.json({ messages: [] });

    const currentSessionMessages = chatDoc.messages
      .filter(m => m.sessionId === sessionId)
      .map(m => ({
        id: m._id,
        type: m.role === 'user' ? 'user' : 'bot',
        content: m.content,
        timestamp: m.timestamp
      }));

    res.json({ messages: currentSessionMessages });
  } catch {
    res.status(500).json({ messages: [] });
  }
};

const getTwinProfile = async (req, res) => {
  try {
    const profile = await twinService.getProfile(req.user._id);
    res.json(profile);
  } catch {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const predictStress = async (req, res) => {
  try {
    const twin = await twinService.getProfile(req.user._id);
    res.json({
      stressScore: Math.round(twin.overallStressScore * 100),
      riskLevel: twin.riskLevel,
      stressors: twin.identifiedStressors?.map(s => s.theme) || []
    });
  } catch {
    res.status(500).json({ stressScore: 0 });
  }
};

const analyzeMood = async (req, res) => {
  try {
    const { journalText } = req.body;
    const result = await callAIWithFailover(
      `Analyze this journal entry for emotional state: "${journalText}". Return ONLY JSON: {"moodScore": 0.0-1.0, "dominantEmotion": "string"}`
    );
    if (result.text) {
      const parsed = safeParseAIResponse(result.text);
      return res.json(parsed || { moodScore: 0.5, dominantEmotion: 'Neutral' });
    }
    res.json({ moodScore: 0.5, dominantEmotion: 'Neutral' });
  } catch {
    res.json({ moodScore: 0.5, dominantEmotion: 'Neutral' });
  }
};

module.exports = { chatWithAI, getChatHistory, getTwinProfile, predictStress, analyzeMood };
