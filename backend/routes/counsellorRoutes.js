const express = require('express');
const { getAppointments, getStudentTrends } = require('../controllers/counsellorController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/appointments', protect, getAppointments);
router.get('/trends/:alias', protect, getStudentTrends);

module.exports = router;

