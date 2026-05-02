const express = require('express');
const { getStressHeatmap, getAccreditationReport } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All admin routes are protected
router.get('/heatmap', protect, getStressHeatmap);
router.get('/report', protect, getAccreditationReport);

module.exports = router;

