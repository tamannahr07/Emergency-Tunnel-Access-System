// Generate card ID in format: SGS-YYYYMMDD-XXXX
const generateCardId = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `SGS-${date}-${random}`;
};

module.exports = { generateCardId };
