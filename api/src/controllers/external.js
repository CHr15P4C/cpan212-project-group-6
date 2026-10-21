import { z } from 'zod';
import { searchMeals } from '../services/mealdb.js';
import { HttpError } from '../utils/HttpError.js';
import { formatIssues, requiredString } from '../validation/schemas.js';

const querySchema = z.object({
  q: requiredString('q').trim().min(1, 'q is required').max(60, 'q must be 60 characters or fewer'),
});

export async function searchExternalMeals(req, res) {
  const parsed = querySchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    throw new HttpError(400, 'Validation failed', formatIssues(parsed.error));
  }
  const results = await searchMeals(parsed.data.q);
  res.status(200).json({ query: parsed.data.q, count: results.length, results });
}
