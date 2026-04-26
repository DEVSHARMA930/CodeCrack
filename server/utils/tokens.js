const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || "student",
      type: "access"
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.accessTokenExpiresIn
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      type: "refresh",
      jti: randomUUID()
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.refreshTokenExpiresIn
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

function getExpiryFromToken(token) {
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getExpiryFromToken
};
