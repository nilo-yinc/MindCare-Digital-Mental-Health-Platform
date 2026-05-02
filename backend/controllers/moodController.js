const Mood = require('../models/Mood');

const saveMood = async (req, res) => {
  try {
    const { score, note } = req.body;
    const mood = await Mood.create({
      user: req.user._id,
      score,
      note
    });
    res.status(201).json(mood);
  } catch (error) {
    res.status(500).json({ message: 'Error saving mood', error: error.message });
  }
};

const getMoodHistory = async (req, res) => {
  try {
    const history = await Mood.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mood history', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user._id }).sort({ date: -1 });
    
    const avgMood = moods.length > 0 
      ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length / 10).toFixed(1) 
      : 0;

    // Calculate streak (simplified)
    let streak = 0;
    const today = new Date().setHours(0,0,0,0);
    for (let i = 0; i < moods.length; i++) {
      const moodDate = new Date(moods[i].date).setHours(0,0,0,0);
      const expectedDate = today - (i * 24 * 60 * 60 * 1000);
      if (moodDate === expectedDate) streak++;
      else break;
    }

    res.json({
      moodScore: avgMood,
      streakDays: streak,
      totalSessions: moods.length, // Placeholder logic
      stressLevel: 24, // Placeholder logic
      history: moods.slice(0, 7).reverse().map(m => ({ value: m.score }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  saveMood,
  getMoodHistory,
  getDashboardStats
};
