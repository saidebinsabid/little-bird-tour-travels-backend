const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Behind a proxy (host) so secure cookies + rate-limit IPs work correctly.
app.set("trust proxy", 1);

// 1) Security headers
app.use(helmet());

// 2) CORS — origins from env (comma-separated); localhost default for dev.
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// NOTE: if you add a Stripe webhook, mount its express.raw() route HERE,
// BEFORE express.json(), so the signature can be verified on the raw body.

// 3) Body parsing (size-limited to blunt large-payload abuse)
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// 4) Strip MongoDB operators ($, .) from user input (NoSQL-injection defense)
app.use(mongoSanitize());

// 5) Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Tighter limiter for auth — guards login/register against brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api/auth", authLimiter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API running successfully!" });
});

// 6) API routes (everything lives under /api)
app.use("/api", apiRoutes);

// 7) 404 + central error handler — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
