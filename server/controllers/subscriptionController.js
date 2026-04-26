const Subscription = require("../models/Subscription");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createSubscription(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address"
      });
    }

    const subscription = await Subscription.create({
      email,
      source: req.body.source || "header"
    });

    return res.status(201).json({
      message: "Subscription successful",
      subscription: {
        id: subscription._id,
        email: subscription.email
      }
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        error: "This email is already subscribed"
      });
    }

    return next(error);
  }
}

module.exports = {
  createSubscription
};
