const mongoose = require('mongoose');

/**
 * UserDigitalTwin — The Silent Profile
 * Built in the background by the TwinService after every chat.
 * Never shown to the user directly. Influences:
 *  - AI persona & empathy calibration
 *  - Suggested action buttons
 *  - Admin heatmap data
 *  - Counselor risk alerts
 */
const userDigitalTwinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Rolling sentiment scores (last N analyses)
  sentimentScores: [{
    score: { type: Number, min: 0, max: 1 },
    emotion: { type: String },
    analyzedAt: { type: Date, default: Date.now }
  }],

  // Recurring themes the AI has identified
  identifiedStressors: [{
    theme: { type: String },        // e.g. "Exam Stress", "Sleep Deprivation"
    frequency: { type: Number, default: 1 },
    firstDetected: { type: Date, default: Date.now },
    lastDetected: { type: Date, default: Date.now }
  }],

  // Calculated composite stress score: S = Wm*(1-Mavg) + Wa*Afreq + We*Eproxy
  overallStressScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.3
  },

  // Current dominant mood state
  dominantMoodState: {
    type: String,
    default: 'Neutral'
  },

  // Risk classification
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Low'
  },

  // Department for heatmap aggregation
  department: {
    type: String,
    default: 'General'
  },

  lastAnalyzedAt: {
    type: Date,
    default: Date.now
  },

  totalInteractions: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('UserDigitalTwin', userDigitalTwinSchema);
