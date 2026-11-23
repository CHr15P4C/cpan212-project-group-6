import { z } from 'zod';
import {
  DAYS,
  MEAL_TYPES,
  LIMITS,
  RECIPE_SORT_FIELDS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants.js';
import { isRealDate } from '../utils/dates.js';

// A string field with clear messages for "missing" and "wrong type".
export const requiredString = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be a string`),
  });

const tooLong = (label, max) => `${label} must be ${max} characters or fewer`;

// ---------------------------------------------------------------------------
// Request bodies. The Mongoose models validate again before saving; zod runs
// first so unknown fields are rejected and the messages stay friendly.
// ---------------------------------------------------------------------------

export const recipeSchema = z
  .object({
    title: requiredString('title').trim().min(1, 'title is required').max(LIMITS.title, tooLong('title', LIMITS.title)),
    ingredients: z
      .array(
        z
          .object({
            name: requiredString('ingredient name')
              .trim()
              .min(1, 'ingredient name is required')
              .max(LIMITS.ingredientName, tooLong('ingredient name', LIMITS.ingredientName)),
            measure: z
              .string()
              .trim()
              .max(LIMITS.ingredientMeasure, tooLong('measure', LIMITS.ingredientMeasure))
              .default(''),
          })
          .strict(),
        { error: (issue) => (issue.input === undefined ? 'ingredients is required' : 'ingredients must be an array') },
      )
      .min(1, 'at least one ingredient is required')
      .max(LIMITS.maxIngredients, `a recipe can have at most ${LIMITS.maxIngredients} ingredients`),
    instructions: requiredString('instructions')
      .trim()
      .min(1, 'instructions are required')
      .max(LIMITS.instructions, tooLong('instructions', LIMITS.instructions)),
    category: z.string().trim().min(1, 'category cannot be empty').max(LIMITS.category, tooLong('category', LIMITS.category)).optional(),
    area: z.string().trim().min(1, 'area cannot be empty').max(LIMITS.area, tooLong('area', LIMITS.area)).optional(),
    imageUrl: z.url('imageUrl must be a valid URL').max(LIMITS.imageUrl, tooLong('imageUrl', LIMITS.imageUrl)).optional(),
    sourceMealId: z.string().trim().min(1, 'sourceMealId cannot be empty').max(LIMITS.sourceMealId, tooLong('sourceMealId', LIMITS.sourceMealId)).optional(),
  })
  .strict();

export const mealPlanSchema = z
  .object({
    name: requiredString('name').trim().min(1, 'name is required').max(LIMITS.planName, tooLong('name', LIMITS.planName)),
    weekStart: requiredString('weekStart')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must look like YYYY-MM-DD')
      .refine(isRealDate, 'weekStart must be a real date'),
    entries: z
      .array(
        z
          .object({
            day: z.enum(DAYS, `day must be one of: ${DAYS.join(', ')}`),
            mealType: z.enum(MEAL_TYPES, `mealType must be one of: ${MEAL_TYPES.join(', ')}`),
            recipeId: requiredString('recipeId').min(1, 'recipeId is required'),
            notes: z.string().trim().max(LIMITS.notes, tooLong('notes', LIMITS.notes)).optional(),
          })
          .strict(),
      )
      .max(LIMITS.maxEntries, `a meal plan can have at most ${LIMITS.maxEntries} entries`)
      .default([]),
  })
  .strict();

// ---------------------------------------------------------------------------
// Query string of GET /api/recipes: filter, sort and pagination.
// ---------------------------------------------------------------------------

const queryText = (label, max) =>
  z.string({ error: `${label} must be a single text value` }).trim().max(max, tooLong(label, max));

const wholeNumber = (label, min) =>
  z.coerce
    .number({ error: `${label} must be a whole number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be ${min} or more`);

export const recipeListQuerySchema = z.object({
  category: queryText('category', LIMITS.category).optional(),
  search: queryText('search', 60).optional(),
  sort: z.enum(RECIPE_SORT_FIELDS, `sort must be one of: ${RECIPE_SORT_FIELDS.join(', ')}`).default('createdAt'),
  order: z.enum(['asc', 'desc'], 'order must be asc or desc').default('desc'),
  page: wholeNumber('page', 1).default(1),
  // A limit above the maximum is not an error: it is capped.
  limit: wholeNumber('limit', 1)
    .default(DEFAULT_PAGE_SIZE)
    .transform((n) => Math.min(n, MAX_PAGE_SIZE)),
});

// Turn a zod error into [{ field, message }] for the error "details".
export function formatIssues(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.length ? issue.path.join('.') : '(body)',
    message: issue.message,
  }));
}
