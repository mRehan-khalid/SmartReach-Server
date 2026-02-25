// server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/databaseConfig');

const PORT = process.env.PORT || 5000;

// server.js
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit process on DB connection failure
  }
};

// Start the server
startServer();