// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Choose URI based on NODE_ENV
    const uri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD // online DB
        : process.env.MONGODB_URI;     // local DB

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
