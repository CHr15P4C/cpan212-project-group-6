// Limits and enums shared by the zod schemas (request validation) and the
// Mongoose schemas (database validation) so the two always agree.

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export const LIMITS = {
  title: 120,
  ingredientName: 100,
  ingredientMeasure: 60,
  maxIngredients: 50,
  instructions: 20000,
  category: 60,
  area: 60,
  imageUrl: 2000,
  sourceMealId: 30,
  planName: 100,
  notes: 200,
  maxEntries: 100,
};

// Recipe list: query parameter rules.
export const RECIPE_SORT_FIELDS = ['title', 'category', 'createdAt', 'updatedAt'];
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
