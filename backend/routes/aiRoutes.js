const express = require('express');
const { chatWithAI, analyzeMood, predictStress, getTwinProfile, getChatHistory } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.get('/chat/history', protect, getChatHistory);
router.post('/analyze-mood', protect, analyzeMood);
router.post('/stress-predict', protect, predictStress);
router.get('/twin-profile', protect, getTwinProfile);

module.exports = router;
