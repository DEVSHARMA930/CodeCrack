const crypto = require("crypto");
const env = require("../config/env");

function hasCloudinaryConfig() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

function parsePdfInput(pdfInput) {
  const input = String(pdfInput || "").trim();

  if (!input) {
    const error = new Error("PDF content is missing");
    error.statusCode = 400;
    throw error;
  }

  const dataUriMatch = input.match(/^data:application\/pdf;base64,(.+)$/i);

  if (dataUriMatch) {
    return Buffer.from(dataUriMatch[1], "base64");
  }

  return Buffer.from(input, "base64");
}

function signUploadParams(params) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(serialized + env.cloudinaryApiSecret).digest("hex");
}

async function uploadPdfToCloudinary({ pdfInput, fileName = "resource.pdf", folder }) {
  if (!hasCloudinaryConfig()) {
    const error = new Error(
      "Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
    error.statusCode = 500;
    throw error;
  }

  const pdfBuffer = parsePdfInput(pdfInput);
  const timestamp = Math.floor(Date.now() / 1000);
  const targetFolder = String(folder || env.cloudinaryFolder || "codecrack").trim();

  const paramsToSign = {
    folder: targetFolder,
    resource_type: "raw",
    timestamp
  };

  const signature = signUploadParams(paramsToSign);
  const endpoint = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/raw/upload`;

  const formData = new FormData();
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), fileName);
  formData.append("api_key", env.cloudinaryApiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", targetFolder);
  formData.append("resource_type", "raw");
  formData.append("signature", signature);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || "Cloudinary upload failed");
    error.statusCode = 502;
    throw error;
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes || 0,
    storageProvider: "cloudinary"
  };
}

module.exports = {
  hasCloudinaryConfig,
  uploadPdfToCloudinary
};
