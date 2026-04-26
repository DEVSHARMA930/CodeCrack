const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const DEV_ACCESS_SECRET = "dev_access_secret_change_me";
const DEV_REFRESH_SECRET = "dev_refresh_secret_change_me";

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || DEV_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || DEV_REFRESH_SECRET;

if (isProduction) {
  if (jwtAccessSecret === DEV_ACCESS_SECRET || jwtRefreshSecret === DEV_REFRESH_SECRET) {
    throw new Error(
      "FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to strong, unique values in production. " +
      "Do not use the default development secrets."
    );
  }
} else {
  if (jwtAccessSecret === DEV_ACCESS_SECRET || jwtRefreshSecret === DEV_REFRESH_SECRET) {
    console.warn(
      "[CodeCrack] WARNING: Using default dev JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET before deploying."
    );
  }
}

// Seed demo content only in development by default. In production, default to false
// so real deployments aren't accidentally populated with dummy data.
const seedContentOnStart = process.env.SEED_CONTENT_ON_START
  ? process.env.SEED_CONTENT_ON_START !== "false"
  : !isProduction;

const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  appOrigin: process.env.APP_ORIGIN || "http://localhost:4000",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codecrack",
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  cookieDomain: process.env.COOKIE_DOMAIN || "",
  pistonUrl: process.env.PISTON_URL || "https://emkc.org/api/v2/piston/execute",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "codecrack",
  seedContentOnStart
};

module.exports = env;
