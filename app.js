// app.js
const express = require('express');
const cors = require('cors');
const routerLoader = require('./routes/router'); // instance of Router
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Dynamic loader
routerLoader.load(app, './controllers'); // automatically loads all controllers

app.get('/', (req, res) => {
  res.send('Server OK');
});

module.exports = app;