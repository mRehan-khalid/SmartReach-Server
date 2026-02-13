require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database'); // function import

// DB connect
connectDB(); // ye hi async DB connect karega

app.get('/', (req, res) => {
  res.send('Server OK');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});