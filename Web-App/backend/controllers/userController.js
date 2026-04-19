const Employee = require('../models/Employee');
const Card = require('../models/Card');
const { generateCode } = require('../utils/generateOTP');
const { generateCardId } = require('../utils/generateCardId');

// @route  POST /api/user/details
// @access Private
const saveDetails = async (req, res, next) => {
  try {
    const { fullName, employeeId, branch, position, email } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!fullName || !employeeId || !branch || !position || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if employee ID already exists under a different user
    const existing = await Employee.findOne({ employeeId: employeeId.toUpperCase() });
    if (existing && existing.userId.toString() !== req.user.id) {
      return res.status(409).json({ success: false, message: 'Employee ID already registered.' });
    }

    const code = generateCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const employee = await Employee.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fullName,
        employeeId: employeeId.toUpperCase(),
        branch,
        position,
        email: email.toLowerCase(),
        photoPath,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        isVerified: false,
        isBiometricDone: false,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Details saved. Verification code generated.',
      verificationCode: code,
      expiresIn: '10 minutes',
      employeeDbId: employee._id,
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/user/verify-code
// @access Private
const verifyCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'No employee record found. Please fill details first.' });
    }

    if (employee.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Authorization failed. Incorrect code.' });
    }

    if (new Date() > employee.verificationCodeExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please restart the process.' });
    }

    employee.isVerified = true;
    await employee.save();

    res.json({ success: true, message: 'Code verified. Proceed to biometric.' });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/user/biometric-done
// @access Private
const biometricDone = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee || !employee.isVerified) {
      return res.status(403).json({ success: false, message: 'Verification step not completed.' });
    }

    employee.isBiometricDone = true;
    await employee.save();

    res.json({ success: true, message: 'Biometric simulation complete.' });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/user/generate-card
// @access Private
const generateCard = async (req, res, next) => {
  try {
    const { rfidUid } = req.body;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee || !employee.isVerified || !employee.isBiometricDone) {
      return res.status(403).json({ success: false, message: 'All verification steps must be completed first.' });
    }

    // If card already exists, return it
    let card = await Card.findOne({ userId: req.user.id });
    if (card) {
      if (rfidUid) { card.rfidUid = rfidUid.toUpperCase(); await card.save(); }
      return res.json({ success: true, card, employee });
    }

    const cardNumber = generateCardId();
    card = await Card.create({
      cardNumber,
      rfidUid: rfidUid ? rfidUid.toUpperCase() : null,
      employeeId: employee._id,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Digital access card generated.',
      card,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/user/profile
// @access Private
const getProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const card = await Card.findOne({ userId: req.user.id });
    res.json({ success: true, employee, card });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveDetails, verifyCode, biometricDone, generateCard, getProfile };
