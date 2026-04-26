const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 80
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500
    },
    tags: {
      type: [String],
      default: []
    },
    pdfUrl: {
      type: String,
      required: true,
      trim: true
    },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "external"],
      default: "external"
    },
    cloudinaryPublicId: {
      type: String,
      default: ""
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

noteSchema.index({ title: "text", subject: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Note", noteSchema);
