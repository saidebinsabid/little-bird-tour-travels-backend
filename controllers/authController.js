/**
 * Auth: register, login, logout, me.
 * Issues a signed JWT in an httpOnly cookie named `accessToken` — the same
 * cookie verifyJWT (middlewares/auth.js) and the Next.js proxy already expect.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { verifyFirebaseToken } = require("../lib/firebaseVerify");

const COLLECTION = "users";
const TOKEN_TTL = "7d";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === "production";

// Cookie options shared by login/register/logout so they always match.
function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProd, // HTTPS-only in production
    sameSite: isProd ? "none" : "lax",
    maxAge: SEVEN_DAYS,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

// Never leak the password hash to the client.
function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!email || !password)
    throw new ApiError(400, "email and password are required");
  if (String(password).length < 6)
    throw new ApiError(400, "password must be at least 6 characters");
  // The simple sign-up form has no name field — derive a friendly default.
  const displayName = name || email.split("@")[0];

  const db = getDB();
  const exists = await db
    .collection(COLLECTION)
    .findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with this email already exists");

  const hash = await bcrypt.hash(password, 10);
  const doc = {
    name: displayName,
    email: email.toLowerCase(),
    password: hash,
    phone: phone || "",
    role: "user", // first real admin is created by the seed script
    avatar: "",
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  const user = { ...doc, _id: result.insertedId };

  res.cookie("accessToken", signToken(user), cookieOptions());
  return res.status(201).json({ message: "Registered", user: publicUser(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "email and password are required");

  const db = getDB();
  const user = await db
    .collection(COLLECTION)
    .findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) throw new ApiError(401, "Invalid credentials");

  res.cookie("accessToken", signToken(user), cookieOptions());
  return res.json({ message: "Logged in", user: publicUser(user) });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", { ...cookieOptions(), maxAge: undefined });
  return res.json({ message: "Logged out" });
});

// POST /api/auth/google  — { idToken } from Firebase client sign-in
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "idToken is required");

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId)
    throw new ApiError(500, "Google sign-in is not configured on the server");

  let payload;
  try {
    payload = await verifyFirebaseToken(idToken, projectId);
  } catch (err) {
    throw new ApiError(401, "Invalid Google sign-in token");
  }

  const email = (payload.email || "").toLowerCase();
  if (!email) throw new ApiError(400, "Google account has no email");

  const db = getDB();
  let user = await db.collection(COLLECTION).findOne({ email });
  if (!user) {
    const doc = {
      name: payload.name || email.split("@")[0],
      email,
      password: "", // Google account — no local password
      phone: "",
      role: "user",
      avatar: payload.picture || "",
      provider: "google",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    user = { ...doc, _id: result.insertedId };
  }

  res.cookie("accessToken", signToken(user), cookieOptions());
  return res.json({ message: "Logged in with Google", user: publicUser(user) });
});

// GET /api/auth/me  (verifyJWT)
const me = asyncHandler(async (req, res) => {
  const db = getDB();
  const user = await db
    .collection(COLLECTION)
    .findOne({ email: req.decoded.email });
  if (!user) throw new ApiError(404, "User not found");
  return res.json({ user: publicUser(user) });
});

module.exports = { register, login, logout, me, googleAuth };
