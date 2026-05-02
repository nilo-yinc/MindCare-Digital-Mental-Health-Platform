const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  token: generateToken(user._id),
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || process.env.ACCESSTOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || process.env.ACCESSTOKEN_EXPIRY || '30d',
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = await User.create({ 
      name, 
      email, 
      password,
      role: role || 'student',
      isVerified: false,
      otp,
      otpExpires
    });

    await sendEmail({
      email: user.email,
      subject: 'MindCare - Verify Your Email',
      html: `<h2>Welcome to MindCare</h2><p>Your verification code is: <strong style="font-size:24px;">${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      ...buildAuthResponse(user),
      message: 'Account verified successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo Account Bypass for seamless testing
    if (password === 'demo123') {
      const demoRoles = {
        'student@demo.com': 'student',
        'counsellor@demo.com': 'counsellor',
        'admin@demo.com': 'admin'
      };
      
      if (demoRoles[email]) {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: `Demo ${demoRoles[email].charAt(0).toUpperCase() + demoRoles[email].slice(1)}`,
            email,
            password: 'demo123',
            role: demoRoles[email],
            isVerified: true
          });
        }
        return res.json(buildAuthResponse(user));
      }
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        email: user.email,
        subject: 'MindCare - Verify Your Email',
        html: `<h2>Verification Required</h2><p>Your verification code is: <strong style="font-size:24px;">${otp}</strong></p>`
      });

      return res.status(403).json({ 
        message: 'Account not verified. OTP sent to your email.',
        email: user.email,
        requiresVerification: true
      });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'MindCare - Password Reset',
      html: `<h2>Password Reset Request</h2><p>Your password reset code is: <strong style="font-size:24px;">${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    });

    res.json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Password Change Notification
    sendEmail({
      email: user.email,
      subject: 'MindCare - Password Changed Successfully',
      message: `Hello ${user.name}, your MindCare password has been updated successfully.`,
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const axios = require('axios'); // Ensure axios is imported at the top if it isn't already, wait I'll just require it here to be safe
const googleLogin = async (req, res) => {
  try {
    const { token, isAccessToken } = req.body;
    let email, name, sub, picture;

    if (isAccessToken) {
      const axios = require('axios');
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      ({ email, name, picture, sub } = response.data);
    } else {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      ({ email, name, sub, picture } = payload);
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId: sub,
        isVerified: true, // Google accounts are implicitly verified
        password: Math.random().toString(36).slice(-8), 
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      user.googleId = sub;
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    isVerified: req.user.isVerified,
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, professional, personal } = req.body;

    if (typeof name === 'string' && name.trim()) {
      req.user.name = name.trim();
    }

    // Accept avatar as a base64 data URL string, but protect against huge payloads
    if (typeof avatar === 'string') {
      const maxAvatarLength = 6_000_000; // ~6MB base64
      if (avatar.length > maxAvatarLength) {
        return res.status(400).json({ message: 'Avatar payload too large' });
      }
      req.user.avatar = avatar;
    }

    // Merge professional fields if provided
    if (professional && typeof professional === 'object') {
      req.user.professional = {
        ...((req.user.professional && req.user.professional.toObject) ? req.user.professional.toObject() : req.user.professional || {}),
        ...professional,
      };
    }

    // Merge personal fields if provided
    if (personal && typeof personal === 'object') {
      req.user.personal = {
        ...((req.user.personal && req.user.personal.toObject) ? req.user.personal.toObject() : req.user.personal || {}),
        ...personal,
      };
    }

    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      professional: req.user.professional,
      personal: req.user.personal,
      isVerified: req.user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
  updateProfile,
};
