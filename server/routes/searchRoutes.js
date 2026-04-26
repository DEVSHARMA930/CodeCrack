const express = require("express");
const { searchGlobal } = require("../controllers/searchController");
const { searchLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", searchLimiter, searchGlobal);

module.exports = router;
