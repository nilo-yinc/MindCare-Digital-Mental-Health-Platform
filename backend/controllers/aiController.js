const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const GlobalChatHistory = require('../models/GlobalChatHistory');
const Mood = require('../models/Mood');
const Resource = require('../models/Resource');
const twinService = require('../services/twinService');
const { v4: uuidv4 } = require('uuid');
const logActivity = require('../utils/activityLogger');

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
    providers.push({
      name: 'Grok-xAI',
      genAI: new GoogleGenerativeAI(xaiKey),
      baseUrl: 'https://api.x.ai/v1'
    });
  }
  return providers;
}

const providers = buildProviders();

const SYSTEM_PROMPT = `You are the MindCare Assistant, a support system for university students. 
Your role is to provide empathetic, concise responses and suggest relevant platform features based on user needs.

CORE IDENTITY:
- Provide support for academic stress, personal wellbeing, and hostel-related challenges.
- Utilize clinical empathy and active listening techniques.

PLATFORM INTEGRATION:
1. THE SANCTUARY: Mood tracking and journaling.
2. PEER BUDDY: Peer support network.
3. RESOURCE HUB: Coping strategies and mindfulness tools.
4. EXPERT BOOKING: Professional counselling.

BEHAVIORAL RULES:
- Be concise and warm. Limit responses to 1-2 paragraphs.
- Always ask a relevant follow-up question.
- Suggest 2-3 platform actions where appropriate.

RESPONSE FORMAT (Valid JSON only):
{
  "message": "...",
  "currentMoodState": "...",
  "suggestedActions": [{"label": "...", "action": "...", "icon": "..."}]
}`;

function getSessionId() {
  return `session_${new Date().toISOString().slice(0, 10)}`;
}

function safeParseAIResponse(text) {
  if (!text || !text.trim()) return null;

  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.message) return parsed;
  } catch { /* continue */ }

  const jsonStart = cleaned.indexOf('{"message"');
  if (jsonStart !== -1) {
    cleaned = cleaned.slice(jsonStart);
  }

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

  return null;
}

async function callAIWithFailover(promptText) {
  const errors = [];
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const provider of providers) {
    for (const modelName of modelsToTry) {
      try {
        const model = provider.genAI.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: promptText }] }]
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout (30s)')), 30000))
        ]);
        const text = result.response.text();
        if (text && text.trim().length > 5) {
          return { text, provider: provider.name, model: modelName, error: null };
        }
      } catch (err) {
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('quota')) {
          errors.push({ provider: provider.name, model: modelName, type: 'RATE_LIMIT' });
        } else {
          errors.push({ provider: provider.name, model: modelName, type: 'UNKNOWN', message: msg });
        }
      }
    }
  }

  return { text: null, provider: null, error: 'ALL_FAILED', errors };
}

const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?._id;
    const sessionId = getSessionId();

    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    let twinProfile;
    try {
      twinProfile = await twinService.getProfile(userId);
    } catch {
      twinProfile = { dominantMoodState: 'Neutral', overallStressScore: 0.3, riskLevel: 'Low' };
    }

    let recommendedResources = [];
    try {
      recommendedResources = await Resource.find({
        category: twinProfile.dominantMoodState
      }).limit(2).lean();
    } catch { /* optional */ }

    const context = `\n\nUSER STATE: StressScore=${twinProfile.overallStressScore}, Mood=${twinProfile.dominantMoodState}`;
    const fullPrompt = `${SYSTEM_PROMPT}${context}\n\nUser message: ${prompt}`;

    const aiResult = await callAIWithFailover(fullPrompt);
    let aiResponse = aiResult.text ? safeParseAIResponse(aiResult.text) : null;

    if (!aiResponse) {
      aiResponse = {
        message: "I'm having trouble connecting right now. Please try again or use our resource hub.",
        currentMoodState: 'Neutral',
        suggestedActions: [{ label: 'Resource Hub', action: 'navigate_to_resources', icon: 'book-open' }]
      };
    }

    try {
      let chatDoc = await Chat.findOne({ user: userId });
      if (!chatDoc) chatDoc = await Chat.create({ user: userId, messages: [] });
      chatDoc.messages.push(
        { role: 'user', content: prompt, sessionId },
        { role: 'model', content: aiResponse.message, sessionId }
      );
      await chatDoc.save();
    } catch (err) {
      console.error('Chat persist error:', err);
    }

    twinService.trainProfile(userId).catch(() => {});
    logActivity(userId, 'chat', 'AI Reflection', 20);

    return res.json(aiResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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
    const result = await callAIWithFailover(`Analyze mood: ${journalText}`);
    if (result.text) {
      const parsed = safeParseAIResponse(result.text);
      return res.json(parsed || { moodScore: 0.5 });
    }
    res.json({ moodScore: 0.5 });
  } catch {
    res.json({ moodScore: 0.5 });
  }
};

module.exports = { chatWithAI, getChatHistory, getTwinProfile, predictStress, analyzeMood };
