require('dotenv').config();
const { connectDB } = require('../config/database');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for seeding (admin only)');

    // Admin seed only
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'adminpass', 10);
      admin = await Admin.create({ name: 'Admin', email: adminEmail, password: hashed });
      console.log('Created admin:', adminEmail);
    } else {
      console.log('Admin already exists:', adminEmail);
    }

    console.log('Admin seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

run();
