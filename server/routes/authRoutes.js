const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  me
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiters");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
