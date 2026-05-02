const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
  googleLogin, 
  register, 
  login, 
  verifyOTP, 
  forgotPassword, 
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
