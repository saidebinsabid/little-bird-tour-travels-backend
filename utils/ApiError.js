/**
 * Operational error with an HTTP status code. Throw it from controllers and
 * the central error handler turns it into a clean JSON response.
 *
 *   throw new ApiError(404, "Item not found");
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
