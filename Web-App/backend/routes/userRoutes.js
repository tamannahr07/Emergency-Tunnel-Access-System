const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  saveDetails,
  verifyCode,
  biometricDone,
  generateCard,
  getProfile,
} = require('../controllers/userController');

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpg, png, webp)'));
    }
  },
});

router.post('/details', protect, upload.single('photo'), saveDetails);
router.post('/verify-code', protect, verifyCode);
router.post('/biometric-done', protect, biometricDone);
router.post('/generate-card', protect, generateCard);
router.get('/profile', protect, getProfile);

module.exports = router;
