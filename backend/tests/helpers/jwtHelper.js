const jwt = require('jsonwebtoken');

function createTestJWT(userId, expiresIn = '7d') {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn }
  );
}

module.exports = { createTestJWT };