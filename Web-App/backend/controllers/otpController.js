const OTP = require('../models/OTP');
const AccessLog = require('../models/AccessLog');
const { generateOTPCode } = require('../utils/generateOTP');

// @route  POST /api/otp/generate
// @access Private (or local network only check)
const generateOTP = async (req, res, next) => {
  try {
    // Invalidate any previous unused OTPs
    await OTP.deleteMany({ isUsed: false });

    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const otp = await OTP.create({
      code,
      generatedBy: req.user ? req.user.id : null,
      expiresAt,
    });

    res.json({
      success: true,
      otp: otp.code,
      expiresAt: otp.expiresAt,
      message: 'OTP generated. Valid for 5 minutes.',
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/otp/verify
// @access Public (called by ESP32 device)
const verifyOTP = async (req, res, next) => {
  try {
    const { code, rfidUid } = req.body;

    const otp = await OTP.findOne({ code, isUsed: false });

    if (!otp) {
      await AccessLog.create({
        rfidUid: rfidUid || null,
        event: 'OTP_FAIL',
        step: 'OTP',
        message: `Invalid OTP entered: ${code}`,
        ipAddress: req.ip,
      });
      return res.status(400).json({ success: false, message: 'Invalid OTP – Access Denied' });
    }

    if (new Date() > otp.expiresAt) {
      await AccessLog.create({
        rfidUid: rfidUid || null,
        event: 'OTP_FAIL',
        step: 'OTP',
        message: 'OTP expired',
        ipAddress: req.ip,
      });
      return res.status(400).json({ success: false, message: 'OTP expired – Generate a new one.' });
    }

    otp.isUsed = true;
    await otp.save();

    await AccessLog.create({
      rfidUid: rfidUid || null,
      event: 'OTP_SUCCESS',
      step: 'OTP',
      message: 'OTP verified successfully',
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'OTP verified – Access Granted – Gate Opening' });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/otp/current
// @access Private
const getCurrentOTP = async (req, res, next) => {
  try {
    const otp = await OTP.findOne({ isUsed: false }).sort({ createdAt: -1 });
    if (!otp) {
      return res.json({ success: false, message: 'No active OTP.' });
    }
    res.json({ success: true, otp: otp.code, expiresAt: otp.expiresAt });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateOTP, verifyOTP, getCurrentOTP };
