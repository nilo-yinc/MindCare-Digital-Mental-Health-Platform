const User = require('../models/User');

// @desc    Get all available counsellors
// @route   GET /api/user/counsellors
const getCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({ role: 'counsellor' })
      .select('name avatar professional email')
      .lean();
    
    res.json(counsellors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/user/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCounsellors,
  getUserProfile
};

