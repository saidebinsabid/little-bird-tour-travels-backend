const ApiError = require("../utils/ApiError");

// 404 for unmatched routes.
function notFound(req, res, next) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Operational ApiErrors return their status/message;
// everything else is logged and returned as a generic 500 (no internals leak).
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
}

module.exports = { notFound, errorHandler };
