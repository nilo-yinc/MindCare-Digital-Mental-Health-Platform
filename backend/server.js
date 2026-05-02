require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const peerRoutes = require('./routes/peerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');


const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.PROD_FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean).map(url => url.replace(/\/$/, '')); // Strip trailing slashes from env vars

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Strip trailing slash from the incoming origin just in case
    const cleanOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
// Increase JSON / URL-encoded body size to allow image uploads as base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counsellor', counsellorRoutes);
app.use('/api/peer', peerRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  const geminiKeyExists = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({ 
    status: 'ok', 
    message: 'MindCare backend is running',
    geminiConfigured: geminiKeyExists,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
