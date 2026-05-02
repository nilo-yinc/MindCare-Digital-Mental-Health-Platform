const mongoose = require('mongoose');

const peerGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mood: { type: String, default: 'Calm' },
  language: { type: String, default: 'English' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    alias: { type: String },
    joinedAt: { type: Date, default: Date.now }
  }],
  messages: [{
    alias: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PeerGroup', peerGroupSchema);

