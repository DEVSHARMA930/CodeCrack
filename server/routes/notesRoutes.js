const express = require("express");
const { listNotes, createNote } = require("../controllers/notesController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { contentReadLimiter, contentWriteLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/", contentReadLimiter, listNotes);
router.post("/", contentWriteLimiter, requireAuth, requireAdmin, createNote);

module.exports = router;
