const express = require("express");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/reviewController");

const router = express.Router();
const admin = [verifyJWT, verifyRole("super-admin")];

router.get("/reviews", c.listReviews); // public — approved only
router.post("/reviews", verifyJWT, c.createReview); // authed
router.get("/reviews/all", ...admin, c.listAllReviews); // admin moderation queue
router.patch("/reviews/:id", ...admin, c.moderateReview);
router.delete("/reviews/:id", ...admin, c.deleteReview);

module.exports = router;
