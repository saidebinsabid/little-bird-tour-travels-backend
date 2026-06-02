const express = require("express");
const { verifyJWT } = require("../middlewares/auth");
const c = require("../controllers/authController");

const router = express.Router();

router.post("/auth/register", c.register); // public
router.post("/auth/login", c.login); // public
router.post("/auth/google", c.googleAuth); // public — Firebase Google sign-in
router.post("/auth/logout", c.logout); // public (clears cookie)
router.get("/auth/me", verifyJWT, c.me); // authed

module.exports = router;
