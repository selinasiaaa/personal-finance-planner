const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGODB URI is missing — skipping DB connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn(`MongoDB connection failed: ${err.message}`);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.warn(`MongoDB disconnect error: ${err.message}`);
  }
}

module.exports = { connectDB, disconnectDB };