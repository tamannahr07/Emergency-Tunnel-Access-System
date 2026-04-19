const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  photoPath: {
    type: String,
    default: null,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpiry: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBiometricDone: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
