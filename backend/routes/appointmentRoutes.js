const express = require('express');
const { createAppointment, getMyAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/', protect, getMyAppointments);
router.put('/:id', protect, updateAppointmentStatus);

module.exports = router;

