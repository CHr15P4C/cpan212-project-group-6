// 404 Handler for unknown routes
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      details: { route: `Cannot ${req.method} ${req.originalUrl}` }
    }
  });
};

// Global Error-Handling Middleware (must have 4 parameters: err, req, res, next)
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'production' ? null : (err.details || null)
    }
  });
};