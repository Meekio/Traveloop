export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}
