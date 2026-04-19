const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  rfidUid: {
    type: String,
    default: null,
    trim: true,
    uppercase: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccess: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Card', CardSchema);
