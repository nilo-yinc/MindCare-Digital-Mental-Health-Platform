const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      sessionId: {
        type: String
      }
    }
  ],
  context: {
    type: String, // Dynamic summary of user's mental state for personalization
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
