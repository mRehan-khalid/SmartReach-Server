const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.MONGO_URI;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, options);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
