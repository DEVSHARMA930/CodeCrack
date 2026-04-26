const { verifyAccessToken } = require("../utils/tokens");

function requireAuth(req, res, next) {
  const bearer = req.headers.authorization;
  const bearerToken = bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : "";
  const cookieToken = req.cookies.cc_access;
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired access token"
    });
  }
}

module.exports = {
  requireAuth
};
