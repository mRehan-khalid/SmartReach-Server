// app.js
const express = require('express');
const cors = require('cors');
const  helmet = require('helmet');
const routerLoader = require('./routes/router'); 
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

routerLoader.load(app, './controllers'); 

app.get('/', (req, res) => {
  res.send('Server OK');
});

app.use(errorMiddleware);

module.exports = app;