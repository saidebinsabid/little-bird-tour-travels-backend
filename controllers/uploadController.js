/**
 * Image upload (admin). Receives a multipart "file", streams it to Cloudinary,
 * returns { url }. The admin image-field uses this; if Cloudinary isn't fully
 * configured yet it returns a clear 503 so the UI can fall back to a URL paste.
 */
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { uploadBuffer, isConfigured } = require("../lib/cloudinary");

// POST /api/upload  (admin, multipart field: "file")
const uploadImage = asyncHandler(async (req, res) => {
  if (!isConfigured())
    throw new ApiError(503, "Image upload not configured (missing CLOUDINARY_API_SECRET). Paste an image URL instead.");
  if (!req.file) throw new ApiError(400, "No file provided");

  const result = await uploadBuffer(req.file.buffer, "little-bird");
  return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
});

module.exports = { uploadImage };
