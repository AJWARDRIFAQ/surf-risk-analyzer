const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error caught by middleware:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle specific known Mongoose error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.keys(err.errors);
    message = `Validation failed for fields: ${fields.join(', ')}`;
  }

  if (err.code && err.code === 11000) {
    statusCode = 400;
    message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // In development, show full stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  // In production, hide stack trace
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;