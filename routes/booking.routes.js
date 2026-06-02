const express = require("express");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/bookingController");

const router = express.Router();
const admin = [verifyJWT, verifyRole("admin", "super-admin", "agent")];

router.post("/bookings", verifyJWT, c.createBooking); // authed customer
router.get("/bookings/me", verifyJWT, c.myBookings); // own bookings
router.get("/bookings", ...admin, c.listBookings); // all (staff)
router.get("/bookings/:id", verifyJWT, c.getBooking); // owner or staff (checked inside)
router.patch("/bookings/:id", ...admin, c.updateBooking); // staff

module.exports = router;
