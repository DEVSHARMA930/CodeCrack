const Note = require("../models/Note");
const { uploadPdfToCloudinary } = require("../services/cloudinaryService");

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  return [];
}

function buildNoteFilter(query) {
  const filter = {};
  const subject = String(query.subject || "").trim();
  const q = String(query.q || "").trim();
  const semesterValue = Number(query.semester);

  if (subject) {
    filter.subject = { $regex: subject, $options: "i" };
  }

  if (Number.isFinite(semesterValue) && semesterValue > 0) {
    filter.semester = semesterValue;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } }
    ];
  }

  return filter;
}

function serializeNote(note) {
  return {
    id: note._id,
    title: note.title,
    subject: note.subject,
    semester: note.semester,
    description: note.description,
    tags: note.tags,
    pdfUrl: note.pdfUrl,
    storageProvider: note.storageProvider,
    createdAt: note.createdAt
  };
}

async function listNotes(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const filter = buildNoteFilter(req.query);

    const notes = await Note.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return res.json({
      items: notes.map(serializeNote)
    });
  } catch (error) {
    return next(error);
  }
}

async function createNote(req, res, next) {
  try {
    const title = String(req.body.title || "").trim();
    const subject = String(req.body.subject || "").trim();
    const semester = Number(req.body.semester);
    const description = String(req.body.description || "").trim();
    const tags = normalizeTags(req.body.tags);

    if (!title || !subject || !Number.isFinite(semester) || semester <= 0) {
      return res.status(400).json({
        error: "Title, subject, and valid semester are required"
      });
    }

    let pdfUrl = String(req.body.pdfUrl || "").trim();
    let storageProvider = pdfUrl ? "external" : "cloudinary";
    let cloudinaryPublicId = "";

    if (!pdfUrl) {
      const pdfInput = req.body.pdfBase64;
      if (!pdfInput) {
        return res.status(400).json({
          error: "Provide either pdfUrl or pdfBase64"
        });
      }

      const uploaded = await uploadPdfToCloudinary({
        pdfInput,
        folder: "codecrack/notes",
        fileName: `${Date.now()}-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      });

      pdfUrl = uploaded.url;
      storageProvider = uploaded.storageProvider;
      cloudinaryPublicId = uploaded.publicId;
    }

    const note = await Note.create({
      title,
      subject,
      semester,
      description,
      tags,
      pdfUrl,
      storageProvider,
      cloudinaryPublicId,
      uploadedBy: req.auth?.userId || null
    });

    return res.status(201).json({
      message: "Note created",
      item: serializeNote(note)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotes,
  createNote
};
