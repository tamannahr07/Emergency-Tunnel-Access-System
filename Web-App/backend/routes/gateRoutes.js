const express = require('express');
const router = express.Router();
const { getGateStatus, openGate, closeGate, getAccessLogs, verifyCard } = require('../controllers/gateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ESP32 polls this — no auth (LAN only)
router.get('/status', getGateStatus);

// Triggered after full OTP success — no auth (device on LAN)
router.post('/open', openGate);

// Access logs (Admin only)
router.get('/logs', protect, adminOnly, getAccessLogs);

// Security Detail Lookup (Security/Admin)
router.get('/card/:cardNumber', protect, adminOnly, verifyCard);

module.exports = router;
