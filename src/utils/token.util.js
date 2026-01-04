const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
};
