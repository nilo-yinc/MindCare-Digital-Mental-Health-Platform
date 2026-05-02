const express = require('express');
const { getHeatmap, getSystemReport } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/heatmap', protect, admin, getHeatmap);
router.get('/report', protect, admin, getSystemReport);

module.exports = router;
