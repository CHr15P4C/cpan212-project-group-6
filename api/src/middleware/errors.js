import { HttpError } from '../utils/HttpError.js';

// 404 for any route that did not match. Mounted after all routes.
export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// The one error handler. Mounted last. Every error response has the shape
// { "error": { "message": "...", "details": ... } } and never a stack trace.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = 'Internal server error';
  let details = null;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  } else {
    // Unexpected error: log it on the server only.
    console.error(err);
  }

  res.status(status).json({ error: { message, details } });
}
