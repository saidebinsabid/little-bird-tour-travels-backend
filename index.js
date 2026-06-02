require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

// Open the DB connection once (cached singleton) — shared by local + serverless.
const dbReady = connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  if (!process.env.VERCEL) process.exit(1);
});

// ── Local development ──────────────────────────────────────────────
// Listen on a port once the DB is connected. Skipped on Vercel, which
// invokes the exported handler instead of running a long-lived server.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  dbReady.then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  });
}

// ── Vercel (serverless) ────────────────────────────────────────────
// Export a handler that ensures the DB is ready, then delegates to the
// Express app. `vercel.json` routes every request here.
module.exports = async (req, res) => {
  await dbReady;
  return app(req, res);
};
