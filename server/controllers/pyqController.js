const PyqPaper = require("../models/PyqPaper");
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

function buildPyqFilter(query) {
  const filter = {};
  const subject = String(query.subject || "").trim();
  const q = String(query.q || "").trim();
  const semesterValue = Number(query.semester);
  const yearValue = Number(query.year);

  if (subject) {
    filter.subject = { $regex: subject, $options: "i" };
  }

  if (Number.isFinite(semesterValue) && semesterValue > 0) {
    filter.semester = semesterValue;
  }

  if (Number.isFinite(yearValue) && yearValue > 0) {
    filter.year = yearValue;
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

function serializePyq(item) {
  return {
    id: item._id,
    title: item.title,
    subject: item.subject,
    year: item.year,
    semester: item.semester,
    examType: item.examType,
    description: item.description,
    tags: item.tags,
    pdfUrl: item.pdfUrl,
    storageProvider: item.storageProvider,
    createdAt: item.createdAt
  };
}

async function listPyq(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const filter = buildPyqFilter(req.query);

    const papers = await PyqPaper.find(filter).sort({ year: -1, createdAt: -1 }).limit(limit).lean();

    return res.json({
      items: papers.map(serializePyq)
    });
  } catch (error) {
    return next(error);
  }
}

async function createPyq(req, res, next) {
  try {
    const title = String(req.body.title || "").trim();
    const subject = String(req.body.subject || "").trim();
    const year = Number(req.body.year);
    const semester = Number(req.body.semester);
    const examType = String(req.body.examType || "Endterm").trim();
    const description = String(req.body.description || "").trim();
    const tags = normalizeTags(req.body.tags);

    if (!title || !subject || !Number.isFinite(year) || !Number.isFinite(semester)) {
      return res.status(400).json({
        error: "Title, subject, year, and semester are required"
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
        folder: "codecrack/pyq",
        fileName: `${Date.now()}-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      });

      pdfUrl = uploaded.url;
      storageProvider = uploaded.storageProvider;
      cloudinaryPublicId = uploaded.publicId;
    }

    const paper = await PyqPaper.create({
      title,
      subject,
      year,
      semester,
      examType,
      description,
      tags,
      pdfUrl,
      storageProvider,
      cloudinaryPublicId,
      uploadedBy: req.auth?.userId || null
    });

    return res.status(201).json({
      message: "PYQ created",
      item: serializePyq(paper)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPyq,
  createPyq
};
