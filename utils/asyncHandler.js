/**
 * Wraps an async route handler so any thrown/rejected error is forwarded to
 * Express's error middleware — removes repetitive try/catch in controllers.
 *
 *   const getThing = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
