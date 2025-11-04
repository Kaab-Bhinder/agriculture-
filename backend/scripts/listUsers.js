const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await connectDB();
    console.log('Connected via script to', mongoose.connection.name);
    const users = await User.find().select('-password').lean();
    console.log('Users:', users);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
