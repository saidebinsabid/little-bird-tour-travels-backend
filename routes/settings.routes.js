const express = require("express");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/settingsController");

const router = express.Router();

router.get("/settings", c.getSettings); // public — site identity/contact/SEO
router.patch(
  "/settings",
  verifyJWT,
  verifyRole("super-admin"),
  c.updateSettings
);

module.exports = router;
