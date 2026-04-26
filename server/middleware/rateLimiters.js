const rateLimit = require("express-rate-limit");

const skipInTests = () => process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please wait and try again."
  }
});

const executeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Execution limit reached. Please try again in a few minutes."
  }
});

const subscriptionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many subscription attempts. Please try again later."
  }
});

const contentReadLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 120,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many content requests. Slow down and retry shortly."
  }
});

const contentWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many write requests. Try again in a few minutes."
  }
});

const searchLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 80,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Search limit reached. Please wait before trying again."
  }
});

module.exports = {
  authLimiter,
  executeLimiter,
  subscriptionLimiter,
  contentReadLimiter,
  contentWriteLimiter,
  searchLimiter
};
