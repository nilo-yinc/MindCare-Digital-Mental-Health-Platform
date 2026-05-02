const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'exercise', 'guide'],
    required: true
  },
  category: {
    type: String, // e.g., 'Anxiety', 'Depression', 'Sleep', 'Academic Stress'
    required: true
  },
  content: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
