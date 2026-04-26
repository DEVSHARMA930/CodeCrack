const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const { connectToDatabase } = require("./config/db");
const { seedContentIfEmpty } = require("./services/seedContentService");
const authRoutes = require("./routes/authRoutes");
const executeRoutes = require("./routes/executeRoutes");
const notesRoutes = require("./routes/notesRoutes");
const pyqRoutes = require("./routes/pyqRoutes");
const searchRoutes = require("./routes/searchRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const rootDir = path.join(__dirname, "..");

const pageFiles = {
  "": "index.html",
  index: "index.html",
  home: "index.html",
  notes: "notes.html",
  pyq: "pyq.html",
  "code-executor": "code-executor.html",
  about: "about.html",
  login: "login.html",
  subscription: "subscription.html",
  terms: "terms.html",
  contact: "contact.html",
  cookies: "cookies.html",
  privacy: "privacy.html",
  faq: "faq.html",
  roadmap: "junior_website_roadmap.html"
};

function sendPage(res, fileName) {
  return res.sendFile(path.join(rootDir, fileName));
}

function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );

  app.use(
    cors({
      origin: env.appOrigin,
      credentials: true
    })
  );

  app.use(express.json({ limit: "4mb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "codecrack-api"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/execute", executeRoutes);
  app.use("/api/subscription", subscriptionRoutes);
  app.use("/api/notes", notesRoutes);
  app.use("/api/pyq", pyqRoutes);
  app.use("/api/search", searchRoutes);

  app.use("/images", express.static(path.join(rootDir, "images")));

  app.get("/styles.css", (req, res) => sendPage(res, "styles.css"));
  app.get("/notes.css", (req, res) => sendPage(res, "notes.css"));
  app.get("/app.js", (req, res) => sendPage(res, "app.js"));

  app.get(["/", "/:slug"], (req, res, next) => {
    const slug = String(req.params.slug || "").toLowerCase();
    const pageFile = pageFiles[slug] || pageFiles[slug.replace(/\.html$/, "")];

    if (!pageFile) {
      return next();
    }

    return sendPage(res, pageFile);
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function startServer(options = {}) {
  const port = options.port ?? env.port;
  const mongoUri = options.mongoUri || env.mongodbUri;
  const seedContent = options.seedContent ?? env.seedContentOnStart;

  await connectToDatabase(mongoUri);

  if (seedContent) {
    await seedContentIfEmpty();
  }

  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`CodeCrack server running at http://localhost:${actualPort}`);
      resolve({ app, server, port: actualPort });
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  startServer
};
