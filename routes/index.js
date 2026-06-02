/**
 * Aggregates every API route under a single router that app.js mounts at /api.
 * Add a new resource: create <domain>.routes.js, then register it here.
 */
const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const contentRoutes = require("./content.routes"); // packages, destinations, hajj, visas, hotels, air-tickets, blogs, banners, coupons
const inquiryRoutes = require("./inquiry.routes");
const bookingRoutes = require("./booking.routes");
const reviewRoutes = require("./review.routes");
const settingsRoutes = require("./settings.routes");
const uploadRoutes = require("./upload.routes");

const router = express.Router();

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", contentRoutes);
router.use("/", inquiryRoutes);
router.use("/", bookingRoutes);
router.use("/", reviewRoutes);
router.use("/", settingsRoutes);
router.use("/", uploadRoutes);

module.exports = router;
