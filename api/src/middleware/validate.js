import { HttpError } from '../utils/HttpError.js';
import { formatIssues } from '../validation/schemas.js';

// validateBody(schema): checks req.body, replaces it with the cleaned data,
// or throws a 400 that lists which fields failed.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new HttpError(400, 'Validation failed', formatIssues(result.error));
    }
    req.body = result.data;
    next();
  };
}
