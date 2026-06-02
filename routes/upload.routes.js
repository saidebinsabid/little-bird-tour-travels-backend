const express = require("express");
const multer = require("multer");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/uploadController");

// In-memory storage (we stream the buffer straight to Cloudinary). Capped at
// 4 MB to stay under Vercel's serverless request-body limit (~4.5 MB).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const router = express.Router();

router.post(
  "/upload",
  verifyJWT,
  verifyRole("admin", "super-admin", "agent"),
  upload.single("file"),
  c.uploadImage
);

module.exports = router;
