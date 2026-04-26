const express = require("express");
const { executeCode } = require("../controllers/executeController");
const { executeLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", executeLimiter, executeCode);

module.exports = router;
