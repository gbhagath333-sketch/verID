const multer = require('multer');

/**
 * Express error handling middleware.
 * Ensures clean JSON error responses without leaking sensitive info.
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds maximum allowed limit (25MB)'
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = errorHandler;
