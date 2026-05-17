// server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/databaseConfig');
const PORT = process.env.PORT || 5000;
const logger = require('./lib/logger');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); 
  }
};

startServer();