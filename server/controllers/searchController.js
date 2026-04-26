const Note = require("../models/Note");
const PyqPaper = require("../models/PyqPaper");

const PAGE_INDEX = [
  { title: "Home", href: "/", keywords: "hero roadmap banner" },
  { title: "Notes", href: "/notes", keywords: "semester subjects pdf" },
  { title: "Code Executor", href: "/code-executor", keywords: "c cpp python run" },
  { title: "Previous Year Paper", href: "/pyq", keywords: "past papers year" },
  { title: "About", href: "/about", keywords: "mission team" },
  { title: "Subscription", href: "/subscription", keywords: "newsletter updates" },
  { title: "Login", href: "/login", keywords: "auth account" },
  { title: "Terms of Use", href: "/terms", keywords: "legal" },
  { title: "Contact Us", href: "/contact", keywords: "email contact" },
  { title: "Cookies", href: "/cookies", keywords: "cookie policy" },
  { title: "Privacy Policy", href: "/privacy", keywords: "privacy" },
  { title: "FAQ", href: "/faq", keywords: "questions" }
];

function matchPages(q) {
  const normalized = q.toLowerCase();
  return PAGE_INDEX.filter((item) => `${item.title} ${item.keywords}`.toLowerCase().includes(normalized)).map(
    (item) => ({
      type: "page",
      title: item.title,
      href: item.href,
      keywords: item.keywords
    })
  );
}

async function searchGlobal(req, res, next) {
  try {
    const query = String(req.query.query || req.query.q || "").trim();

    if (!query) {
      return res.json({
        items: PAGE_INDEX.map((item) => ({
          type: "page",
          title: item.title,
          href: item.href,
          keywords: item.keywords
        }))
      });
    }

    const regex = { $regex: query, $options: "i" };

    const [notes, pyq] = await Promise.all([
      Note.find({ $or: [{ title: regex }, { subject: regex }, { tags: regex }, { description: regex }] })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      PyqPaper.find({ $or: [{ title: regex }, { subject: regex }, { tags: regex }, { description: regex }] })
        .sort({ year: -1, createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    const items = [
      ...matchPages(query),
      ...notes.map((item) => ({
        type: "note",
        title: item.title,
        href: "/notes",
        keywords: `${item.subject} semester ${item.semester}`,
        meta: {
          subject: item.subject,
          semester: item.semester,
          pdfUrl: item.pdfUrl
        }
      })),
      ...pyq.map((item) => ({
        type: "pyq",
        title: item.title,
        href: "/pyq",
        keywords: `${item.subject} ${item.year}`,
        meta: {
          subject: item.subject,
          year: item.year,
          pdfUrl: item.pdfUrl
        }
      }))
    ];

    return res.json({ items });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchGlobal
};
