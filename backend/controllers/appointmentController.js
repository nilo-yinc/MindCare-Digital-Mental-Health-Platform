const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments
const createAppointment = async (req, res) => {
  try {
    const { counsellorId, date, time, type, reason } = req.body;
    
    const appointment = await Appointment.create({
      student: req.user._id,
      counsellor: counsellorId,
      date,
      time,
      type,
      reason
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user appointments (Student or Counsellor)
// @route   GET /api/appointments
const getMyAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'student' 
      ? { student: req.user._id } 
      : { counsellor: req.user._id };

    const appointments = await Appointment.find(filter)
      .populate('student', 'name email avatar')
      .populate('counsellor', 'name email avatar professional')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Only allow update if user is the student or counsellor
    if (appointment.student.toString() !== req.user._id.toString() && 
        appointment.counsellor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = status || appointment.status;
    if (req.user.role === 'counsellor' && notes) {
      appointment.notes = notes;
    }

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus
};
