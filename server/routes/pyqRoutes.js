const express = require("express");
const { listPyq, createPyq } = require("../controllers/pyqController");
const { requireAuth } = require("../middleware/auth");
const { contentReadLimiter, contentWriteLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", contentReadLimiter, listPyq);
router.post("/", contentWriteLimiter, requireAuth, createPyq);

module.exports = router;
