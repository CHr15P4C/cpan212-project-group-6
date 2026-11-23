import { HttpError } from './HttpError.js';

// Strictly 24 hex characters. mongoose.isValidObjectId() is looser (it also
// accepts any 12-character string), so we use our own check.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function isObjectId(value) {
  return typeof value === 'string' && OBJECT_ID.test(value);
}

// A badly formed id can never match a document, so it is a 404 just like an
// id that is well formed but not in the database.
export function assertObjectId(id, label) {
  if (!isObjectId(id)) {
    throw new HttpError(404, `${label} not found: ${id}`);
  }
}
