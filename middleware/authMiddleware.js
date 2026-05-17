const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Header se token uthao
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // 2️⃣ Token verify karo
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 3️⃣ User info request me attach
    req.user = decoded;

    // 4️⃣ next controller / route
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;