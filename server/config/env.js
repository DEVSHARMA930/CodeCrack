const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  appOrigin: process.env.APP_ORIGIN || "http://localhost:4000",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codecrack",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  cookieDomain: process.env.COOKIE_DOMAIN || "",
  pistonUrl: process.env.PISTON_URL || "https://emkc.org/api/v2/piston/execute",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "codecrack",
  seedContentOnStart: process.env.SEED_CONTENT_ON_START !== "false"
};

module.exports = env;
