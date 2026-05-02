const express = require('express');
const { saveMood, getMoodHistory, getDashboardStats } = require('../controllers/moodController');
const { getCounsellors, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/check-in', protect, saveMood);
router.get('/history', protect, getMoodHistory);
router.get('/stats', protect, getDashboardStats);
router.get('/counsellors', protect, getCounsellors);
router.get('/profile', protect, getUserProfile);

module.exports = router;
