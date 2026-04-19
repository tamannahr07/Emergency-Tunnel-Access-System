/**
 * Seed script — populates MongoDB with military test data
 * Run: node seedData.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

// Models
const User     = require('./models/User');
const Employee = require('./models/Employee');
const Card     = require('./models/Card');
const AccessLog = require('./models/AccessLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartgate';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Card.deleteMany({}),
      AccessLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Authorized Users ─────────────────────────────
    const usersData = [
      { email: 'admin@gate.local',           password: 'admin123',   role: 'admin'    },
      { email: 'security@gate.local',        password: 'security123', role: 'security'},
      { email: 'tamannasaini860@gmail.com',  password: 'tanusaini',  role: 'user'     },
      { email: 'sonakshidhiman12@gmail.com', password: 'sonakshi12', role: 'user'     },
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create({
        email: u.email,
        password: u.password,
        role: u.role
      });
      users.push(user);
      console.log(`👤 Created user: ${u.email} (${u.role})`);
    }

    // ── Create Employees (Authorized & Mock) ────────────────
    const employeesData = [
      {
        userId: users[2]._id,
        fullName: 'Tamanna saini',
        employeeId: '13257062',
        branch: 'defense security',
        position: 'solider',
        email: 'tamannasaini860@gmail.com',
        isVerified: true,
        isBiometricDone: true,
      },
      {
        userId: users[3]._id,
        fullName: 'Sonakshi Dhiman',
        employeeId: '13257035',
        branch: 'defense security',
        position: 'solider',
        email: 'sonakshidhiman12@gmail.com',
        isVerified: true,
        isBiometricDone: true,
      },
      {
        fullName: 'Vikram Singh',
        employeeId: '13257099',
        branch: 'defense intelligence',
        position: 'major',
        email: 'vikram.s@mil.local',
        userId: users[1]._id,
        isVerified: true,
        isBiometricDone: true,
      },
      {
        fullName: 'Arjun Mehra',
        employeeId: '13257105',
        branch: 'security operations',
        position: 'general',
        email: 'arjun.m@mil.local',
        userId: users[1]._id,
        isVerified: true,
        isBiometricDone: true,
      }
    ];

    const employees = [];
    for (const e of employeesData) {
      const emp = await Employee.create(e);
      employees.push(emp);
      console.log(`🪪 Created employee record: ${e.fullName} (${e.branch})`);
    }

    // ── Create Cards ───────────────────────────────────────
    const cardsData = [
      {
        cardNumber: 'SGS-20260406-6436',
        rfidUid: '51F2D26',
        employeeId: employees[0]._id,
        userId: users[2]._id,
        isActive: true,
        accessCount: 42,
      },
      {
        cardNumber: 'SGS-20260406-7102',
        rfidUid: 'A780D46',
        employeeId: employees[1]._id,
        userId: users[3]._id,
        isActive: true,
        accessCount: 12,
      },
      {
        cardNumber: 'B9C2F55',
        employeeId: employees[2]._id,
        userId: users[1]._id,
        isActive: true,
        accessCount: 5,
      },
      {
        cardNumber: 'D1E0A88',
        employeeId: employees[3]._id,
        userId: users[1]._id,
        isActive: true,
        accessCount: 1,
      }
    ];

    for (const c of cardsData) {
      await Card.create(c);
      console.log(`💳 Created card: ${c.cardNumber} [${c.isActive ? 'ACTIVE' : 'INACTIVE'}]`);
    }

    // ── Create Sample Access Logs ──────────────────────────
    const logs = [
      { cardNumber: '51F2D26', employeeName: 'Tamanna saini', employeeId: '13257062', event: 'ACCESS_GRANTED', step: 'GATE', message: 'Biometric Verified' },
      { cardNumber: 'A780D46', employeeName: 'Sonakshi Dhiman', employeeId: '13257035', event: 'ACCESS_GRANTED', step: 'GATE', message: 'Gate Access Granted' },
      { cardNumber: 'UNKNOWN', employeeName: 'Unknown', employeeId: 'N/A', event: 'ACCESS_DENIED', step: 'GATE', message: 'No record found' },
      { cardNumber: 'B9C2F55', employeeName: 'Vikram Singh', employeeId: '13257099', event: 'FINGERPRINT_FAIL', step: 'FINGERPRINT', message: 'Retry required' },
      { cardNumber: 'D1E0A88', employeeName: 'Arjun Mehra', employeeId: '13257105', event: 'ACCESS_GRANTED', step: 'GATE', message: 'Commander Entry' },
    ];

    for (const log of logs) {
      await AccessLog.create(log);
    }
    console.log(`📝 Generated ${logs.length} detailed access logs`);

    console.log('\n🌟 Military Deployment Seed Complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
