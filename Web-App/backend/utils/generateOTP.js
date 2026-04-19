// Generate a 4-digit verification code (for details page)
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate a 4-digit OTP (for gate access)
const generateOTPCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = { generateCode, generateOTPCode };
