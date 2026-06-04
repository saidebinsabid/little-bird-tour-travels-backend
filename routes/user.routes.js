const express = require("express");
const { verifyJWT, verifyRole } = require("../middlewares/auth");
const c = require("../controllers/userController");

const router = express.Router();
const admin = [verifyJWT, verifyRole("super-admin")];

router.get("/users", ...admin, c.listUsers);
router.patch("/users/:id/role", ...admin, c.updateRole);
router.delete("/users/:id", ...admin, c.deleteUser);

module.exports = router;
