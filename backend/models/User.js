const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String
  },
  professional: {
    title: { type: String },
    organization: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    linkedin: { type: String }
  },
  personal: {
    dob: { type: Date },
    pronouns: { type: String },
    interests: [{ type: String }],
    location: { type: String },
    about: { type: String }
  },
  phoneNumber: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

