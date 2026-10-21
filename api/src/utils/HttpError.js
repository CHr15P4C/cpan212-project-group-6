// An error with an HTTP status code. The error-handling middleware turns it
// into the shape { "error": { "message": "...", "details": ... } }.
export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}
