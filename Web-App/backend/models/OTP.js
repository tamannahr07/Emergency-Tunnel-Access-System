const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    // TTL index — MongoDB auto-deletes after expiry
    index: { expires: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('OTP', OTPSchema);
