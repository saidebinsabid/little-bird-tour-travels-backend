const express = require("express");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/inquiryController");

const router = express.Router();
const staff = [verifyJWT, verifyRole("admin", "super-admin", "agent")];

router.post("/inquiries", c.createInquiry); // public — every lead form posts here
router.get("/inquiries", ...staff, c.listInquiries);
router.patch("/inquiries/:id", ...staff, c.updateInquiry);
router.delete(
  "/inquiries/:id",
  verifyJWT,
  verifyRole("admin", "super-admin"),
  c.deleteInquiry
);

module.exports = router;
