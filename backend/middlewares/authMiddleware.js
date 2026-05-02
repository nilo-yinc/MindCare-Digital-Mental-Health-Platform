const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  console.log('[AUTH] Checking authorization header...');
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH] Token found. Verifying...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.ACCESSTOKEN_SECRET);
      console.log('[AUTH] Token verified. User ID:', decoded.id);
      
      const user = await User.findById(decoded.id).select('-password -otp -otpExpires');
      if (!user) {
        console.warn('[AUTH] User not found in database');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = user;
      console.log('[AUTH] Authorization successful');
      next();
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    console.warn('[AUTH] No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
