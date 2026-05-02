const mongoose = require('mongoose');

const departmentHeatmapSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    index: true
  },
  avgStressScore: {
    type: Number,
    default: 0
  },
  totalAnalyses: {
    type: Number,
    default: 0
  },
  stressDistribution: {
    low: { type: Number, default: 0 },
    moderate: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    critical: { type: Number, default: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('DepartmentHeatmap', departmentHeatmapSchema);

