import { z } from 'zod';
import { searchMeals, getCategories, filterMealsByCategory, lookupMealById } from '../services/mealdb.js';
import { HttpError } from '../utils/HttpError.js';
import { formatIssues, requiredString } from '../validation/schemas.js';

const querySchema = z.object({
  q: requiredString('q').trim().min(1, 'q is required').max(60, 'q must be 60 characters or fewer'),
});

const categoryParamSchema = z.object({
  categoryname: requiredString('categoryname').trim().min(1, 'categoryname is required'),
});

export async function searchExternalMeals(req, res) {
  const parsed = querySchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    throw new HttpError(400, 'Validation failed', formatIssues(parsed.error));
  }

  const queryValue = parsed.data.q;
  let results;

  // Check if the query is a numeric ID (e.g., "52772")
  if (/^\d+$/.test(queryValue)) {
    results = await lookupMealById(queryValue);
  } else {
    results = await searchMeals(queryValue);
  }

  res.status(200).json({ query: queryValue, count: results.length, results });
}

export async function getExternalCategories(req, res) {
  const categories = await getCategories();
  res.status(200).json({ count: categories.length, categories });
}

export async function getExternalMealsByCategory(req, res) {
  const parsed = categoryParamSchema.safeParse({ categoryname: req.params.categoryname });
  if (!parsed.success) {
    throw new HttpError(400, 'Validation failed', formatIssues(parsed.error));
  }
  const results = await filterMealsByCategory(parsed.data.categoryname);
  res.status(200).json({ category: parsed.data.categoryname, count: results.length, results });
}