const User = require('../models/User');
const Mood = require('../models/Mood');

/**
 * Get Anonymous Appointment Requests
 */
const getAppointments = async (req, res) => {
  try {
    // In MindCare, student identities are masked by "Buddy Aliases"
    // We simulate a list of pending requests
    const aliases = ['Silent Guardian', 'Zen Seeker', 'Midnight Echo', 'Crystal Calm'];
    
    const appointments = aliases.map((alias, i) => ({
      id: `APT-${1000 + i}`,
      studentAlias: alias,
      urgency: i === 0 ? 'High' : 'Moderate',
      type: i % 2 === 0 ? 'Video' : 'Chat',
      time: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      status: 'Pending'
    }));

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

/**
 * Get Sentiment Trends for an Anonymous Student
 */
const getStudentTrends = async (req, res) => {
  try {
    // Simulated trend data based on anonymized Mood logs
    const trends = [
      { date: '2024-05-01', score: 45 },
      { date: '2024-05-02', score: 52 },
      { date: '2024-05-03', score: 38 },
      { date: '2024-05-04', score: 30 }, // Burnout indicator
      { date: '2024-05-05', score: 42 },
    ];
    
    res.json({
      alias: "Zen Seeker",
      riskIndicator: "Moderate Burnout",
      dominantEmotion: "Academic Anxiety",
      trends
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student trends' });
  }
};

module.exports = {
  getAppointments,
  getStudentTrends
};

