import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

// 404 for any route that did not match. Mounted after all routes.
export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Mongoose reports a failed schema check as one error holding every failed
// field, keyed by path ("title", "ingredients.0.name", "entries.2.day", ...).
function mongooseValidationDetails(err) {
  return Object.entries(err.errors).map(([field, problem]) => ({ field, message: problem.message }));
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
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Data that breaks the Mongoose schema is the client's mistake: 400, not 500.
    status = 400;
    message = 'Validation failed';
    details = mongooseValidationDetails(err);
  } else if (err instanceof mongoose.Error.CastError) {
    if (err.path === '_id') {
      // An id that cannot be an ObjectId can never match a document.
      status = 404;
      message = 'Resource not found';
    } else {
      status = 400;
      message = 'Validation failed';
      details = [{ field: err.path, message: `${err.path} has an invalid value` }];
    }
  } else if (err instanceof mongoose.Error.MongooseServerSelectionError) {
    console.error(err);
    status = 503;
    message = 'Database is not available';
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
