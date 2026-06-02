/**
 * Cloudinary service. Configured once from env. uploadBuffer streams an
 * in-memory file (from multer) straight to Cloudinary and resolves the secure
 * URL. Requires CLOUDINARY_API_SECRET to be set — until then uploads will error
 * (admins can still paste image URLs directly).
 */
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function uploadBuffer(buffer, folder = "little-bird") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBuffer, isConfigured };
