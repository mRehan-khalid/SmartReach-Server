const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', (req, res) => {
  res.json({
    message: 'Protected route',
    user: req.user
  });
});

module.exports = router;
