const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/user',   require('./routes/userRoutes'));
app.use('/api/gate',   require('./routes/gateRoutes'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), system: 'Smart Gate Security System' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Gate Backend running on http://localhost:${PORT}`);
  console.log(`📡 MongoDB: ${process.env.MONGO_URI}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
