/**
 * asyncHandler.js
 * Shared async error wrapper for route handlers.
 * Catches unhandled promise rejections and forwards them to the global error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
