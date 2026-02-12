require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

db.open((err) => {
  if (err) {
    console.log('DB connection failed');
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
