const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

const secret = process.env.JWT_SECRET;

// Verify the JWT from the httpOnly cookie. Attaches req.decoded.
async function verifyJWT(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "unauthorized access" });
  }
  try {
    req.decoded = jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(403).json({ message: "forbidden access" });
  }
}

// Factory: build a role guard for any role(s). Use after verifyJWT.
//   router.post("/admin-thing", verifyJWT, verifyRole("super-admin"), ctrl.fn)
function verifyRole(...allowedRoles) {
  return async function (req, res, next) {
    try {
      const email = req.decoded.email;
      const db = getDB();
      const user = await db.collection("users").findOne({ email });

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "forbidden access" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("verifyRole error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = {
  verifyJWT,
  verifyRole,
  // Convenience aliases — add the roles your app uses:
  verifyAdmin: verifyRole("super-admin"),
};
