const Card = require('../models/Card');
const Employee = require('../models/Employee');
const AccessLog = require('../models/AccessLog');

// @route  GET /api/verify/card/:cardNumber
// @access Private (security staff)
const verifyCard = async (req, res, next) => {
  try {
    const { cardNumber } = req.params;

    const card = await Card.findOne({ cardNumber: cardNumber.toUpperCase() });
    if (!card) {
      return res.status(404).json({ success: false, message: 'No record found.' });
    }

    const employee = await Employee.findById(card.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    res.json({
      success: true,
      data: {
        cardNumber: card.cardNumber,
        rfidUid: card.rfidUid,
        isActive: card.isActive,
        accessCount: card.accessCount,
        lastAccess: card.lastAccess,
        employee: {
          fullName: employee.fullName,
          employeeId: employee.employeeId,
          branch: employee.branch,
          position: employee.position,
          email: employee.email,
          photoPath: employee.photoPath,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/verify/rfid
// @access Public (called by ESP32)
const verifyRFID = async (req, res, next) => {
  try {
    const { rfidUid } = req.body;
    if (!rfidUid) {
      return res.status(400).json({ success: false, message: 'RFID UID required.' });
    }

    const card = await Card.findOne({ rfidUid: rfidUid.toUpperCase(), isActive: true });

    if (!card) {
      await AccessLog.create({
        rfidUid,
        event: 'RFID_FAIL',
        step: 'RFID',
        message: `Unknown RFID: ${rfidUid}`,
        ipAddress: req.ip,
      });
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const employee = await Employee.findById(card.employeeId);
    await AccessLog.create({
      cardNumber: card.cardNumber,
      rfidUid,
      employeeName: employee ? employee.fullName : 'Unknown',
      employeeId: employee ? employee.employeeId : null,
      event: 'RFID_SUCCESS',
      step: 'RFID',
      message: 'RFID card accepted. Proceed to fingerprint.',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Access Authorized – Proceed to Fingerprint',
      employeeName: employee ? employee.fullName : null,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/verify/logs
// @access Private (admin)
const getAccessLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AccessLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AccessLog.countDocuments();

    res.json({ success: true, logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyCard, verifyRFID, getAccessLogs };
