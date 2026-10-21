import { z } from 'zod';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// A string field with clear messages for "missing" and "wrong type".
export const requiredString = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be a string`),
  });

const isRealDate = (s) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
};

export const recipeSchema = z
  .object({
    title: requiredString('title').trim().min(1, 'title is required').max(120, 'title must be 120 characters or fewer'),
    ingredients: z
      .array(
        z
          .object({
            name: requiredString('ingredient name').trim().min(1, 'ingredient name is required'),
            measure: z.string().trim().default(''),
          })
          .strict(),
        { error: (issue) => (issue.input === undefined ? 'ingredients is required' : 'ingredients must be an array') },
      )
      .min(1, 'at least one ingredient is required'),
    instructions: requiredString('instructions').trim().min(1, 'instructions are required'),
    category: z.string().trim().min(1).optional(),
    area: z.string().trim().min(1).optional(),
    imageUrl: z.url('imageUrl must be a valid URL').optional(),
    sourceMealId: z.string().trim().min(1).optional(),
  })
  .strict();

export const mealPlanSchema = z
  .object({
    name: requiredString('name').trim().min(1, 'name is required').max(100, 'name must be 100 characters or fewer'),
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
            notes: z.string().trim().max(200, 'notes must be 200 characters or fewer').optional(),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

// Turn a zod error into [{ field, message }] for the error "details".
export function formatIssues(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.length ? issue.path.join('.') : '(body)',
    message: issue.message,
  }));
}
