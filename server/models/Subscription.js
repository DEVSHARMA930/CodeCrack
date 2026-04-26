const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    source: {
      type: String,
      default: "header"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
