const mongoose = require('mongoose');

/**
 * GlobalChatHistory — The Hidden Memory Layer
 * Stores EVERY message ever exchanged. The UI never reads this directly.
 * The TwinService reads this to build the UserDigitalTwin profile.
 */
const globalChatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    moodSnapshot: { type: Number, min: 0, max: 1, default: 0.5 },
    detectedEmotion: { type: String, default: 'Neutral' },
    stressorsDetected: [{ type: String }]
  }
}, { timestamps: true });

// Index for fast retrieval of recent messages per user
globalChatHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('GlobalChatHistory', globalChatHistorySchema);

