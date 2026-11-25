import { HttpError } from '../utils/HttpError.js';
import { formatIssues } from '../validation/schemas.js';

export const validateBody = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(
      new HttpError(
        400,
        'Validation failed',
        formatIssues(result.error)
      )
    );
  }

  req.body = result.data;
  next();
};
