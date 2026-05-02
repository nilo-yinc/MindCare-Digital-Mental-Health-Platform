const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['meditation', 'exercise', 'sleep', 'journaling', 'peer-support', 'check-in', 'appointment', 'chat'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
