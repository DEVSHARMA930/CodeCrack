const express = require("express");
const { createSubscription } = require("../controllers/subscriptionController");
const { subscriptionLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/", subscriptionLimiter, createSubscription);

module.exports = router;
