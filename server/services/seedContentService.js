const Note = require("../models/Note");
const PyqPaper = require("../models/PyqPaper");

const DEMO_NOTES = [
  {
    title: "Programming Fundamentals - Unit 1 to 3",
    subject: "Programming Fundamentals",
    semester: 1,
    description: "Quick revision notes covering C basics and problem-solving patterns.",
    tags: ["c", "unit-wise", "revision"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  },
  {
    title: "Data Structures - Full Semester Notes",
    subject: "Data Structures",
    semester: 3,
    description: "Handy notes for stacks, queues, linked lists, trees, and graphs.",
    tags: ["dsa", "important", "exam"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  },
  {
    title: "DBMS Short Notes",
    subject: "DBMS",
    semester: 4,
    description: "One-shot notes for normalization, indexing, and transaction basics.",
    tags: ["dbms", "short-notes", "final"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  }
];

const DEMO_PYQ = [
  {
    title: "Data Structures - 2024",
    subject: "Data Structures",
    year: 2024,
    semester: 3,
    examType: "Midterm + Endterm",
    description: "Includes two sets from 2024 with marking pattern.",
    tags: ["dsa", "2024"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  },
  {
    title: "Computer Networks - 2023",
    subject: "Computer Networks",
    year: 2023,
    semester: 4,
    examType: "Theory",
    description: "Semester 4 theory paper set.",
    tags: ["cn", "2023"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  },
  {
    title: "Operating Systems - 2022",
    subject: "Operating Systems",
    year: 2022,
    semester: 4,
    examType: "Endterm + Practical",
    description: "Combined endterm and practical PYQ document.",
    tags: ["os", "2022"],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    storageProvider: "external"
  }
];

async function seedContentIfEmpty() {
  const [noteCount, pyqCount] = await Promise.all([Note.countDocuments(), PyqPaper.countDocuments()]);

  if (noteCount === 0) {
    await Note.insertMany(DEMO_NOTES);
  }

  if (pyqCount === 0) {
    await PyqPaper.insertMany(DEMO_PYQ);
  }
}

module.exports = {
  seedContentIfEmpty
};
