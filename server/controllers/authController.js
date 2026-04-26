const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { setAuthCookies, clearAuthCookies } = require("../utils/cookies");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getExpiryFromToken
} = require("../utils/tokens");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function getSessionMeta(req) {
  return {
    ipAddress: req.ip || "",
    userAgent: req.get("user-agent") || ""
  };
}

async function issueSession(user, req, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = getExpiryFromToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
    ...getSessionMeta(req)
  });

  setAuthCookies(res, accessToken, refreshToken);
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || "Student").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name || "Student",
      email,
      passwordHash
    });

    await issueSession(user, req, res);

    return res.status(201).json({
      message: "Registration successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    await issueSession(user, req, res);

    return res.json({
      message: "Login successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const currentRefresh = req.cookies.cc_refresh;

    if (!currentRefresh) {
      return res.status(401).json({
        error: "Refresh token missing"
      });
    }

    let payload;

    try {
      payload = verifyRefreshToken(currentRefresh);
    } catch (error) {
      return res.status(401).json({
        error: "Invalid refresh token"
      });
    }

    const tokenRecord = await RefreshToken.findOne({
      token: currentRefresh,
      user: payload.sub,
      revokedAt: null
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: "Refresh token expired"
      });
    }

    tokenRecord.revokedAt = new Date();
    await tokenRecord.save();

    const user = await User.findById(payload.sub);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        error: "User no longer exists"
      });
    }

    await issueSession(user, req, res);

    return res.json({
      message: "Session refreshed",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const currentRefresh = req.cookies.cc_refresh;

    if (currentRefresh) {
      await RefreshToken.updateOne(
        {
          token: currentRefresh,
          revokedAt: null
        },
        {
          $set: {
            revokedAt: new Date()
          }
        }
      );
    }

    clearAuthCookies(res);

    return res.json({
      message: "Logout successful"
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).select("_id name email role");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    return res.json({
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
