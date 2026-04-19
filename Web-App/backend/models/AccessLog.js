const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    default: null,
  },
  rfidUid: {
    type: String,
    default: null,
  },
  employeeName: {
    type: String,
    default: 'Unknown',
  },
  employeeId: {
    type: String,
    default: null,
  },
  event: {
    type: String,
    enum: [
      'RFID_SUCCESS',
      'RFID_FAIL',
      'FINGERPRINT_SUCCESS',
      'FINGERPRINT_FAIL',
      'OTP_SUCCESS',
      'OTP_FAIL',
      'GATE_OPEN',
      'GATE_CLOSE',
      'ACCESS_GRANTED',
      'ACCESS_DENIED',
    ],
    required: true,
  },
  step: {
    type: String,
    enum: ['RFID', 'FINGERPRINT', 'OTP', 'GATE'],
    default: 'RFID',
  },
  message: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', AccessLogSchema);
