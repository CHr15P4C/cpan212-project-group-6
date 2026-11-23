import { Recipe } from '../models/Recipe.js';
import { MealPlan } from '../models/MealPlan.js';
import { HttpError } from '../utils/HttpError.js';
import { assertObjectId } from '../utils/ids.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { formatIssues, recipeListQuerySchema } from '../validation/schemas.js';

// Optional recipe fields. PUT replaces the whole recipe, so any of these that
// the request leaves out must be removed from the stored document.
const OPTIONAL_FIELDS = ['category', 'area', 'imageUrl', 'sourceMealId'];

// Every update uses these options: return the new version and run the
// schema validators (they do not run on updates unless asked).
const UPDATE_OPTIONS = { returnDocument: 'after', runValidators: true };

// "?category=" and "?search=   " mean "no filter", not "match nothing".
function withoutBlanks(query) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => !(typeof value === 'string' && value.trim() === '')),
  );
}

// GET /api/recipes?category=&search=&sort=&order=&page=&limit=
export async function listRecipes(req, res) {
  const parsed = recipeListQuerySchema.safeParse(withoutBlanks(req.query));
  if (!parsed.success) {
    throw new HttpError(400, 'Validation failed', formatIssues(parsed.error));
  }
  const { category, search, sort, order, page, limit } = parsed.data;

  // The filter is built only from validated values. User text goes through
  // escapeRegex(), so "c++" or ".*" is searched as plain text.
  const filter = {};
  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { 'ingredients.name': pattern }];
  }

  // `sort` can only be one of the allowlisted fields (zod enum). _id is added
  // as a tie-breaker so a page boundary never repeats or skips a recipe.
  const direction = order === 'asc' ? 1 : -1;
  const sortSpec = { [sort]: direction, _id: direction };

  const [total, items] = await Promise.all([
    Recipe.countDocuments(filter),
    Recipe.find(filter)
      .sort(sortSpec)
      .collation({ locale: 'en', strength: 2 }) // A–Z ignores upper/lower case
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.status(200).json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

// GET /api/recipes/categories: the categories in use, for the filter dropdown.
export async function listRecipeCategories(req, res) {
  const names = await Recipe.distinct('category');
  const byLowerCase = new Map();
  for (const name of names) {
    if (typeof name === 'string' && name && !byLowerCase.has(name.toLowerCase())) {
      byLowerCase.set(name.toLowerCase(), name);
    }
  }
  const categories = [...byLowerCase.values()].sort((a, b) => a.localeCompare(b));
  res.status(200).json({ categories });
}

export async function getRecipe(req, res) {
  assertObjectId(req.params.id, 'Recipe');
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new HttpError(404, `Recipe not found: ${req.params.id}`);
  res.status(200).json(recipe);
}

export async function createRecipe(req, res) {
  const recipe = await Recipe.create(req.body);
  res.status(201).json(recipe);
}

export async function updateRecipe(req, res) {
  assertObjectId(req.params.id, 'Recipe');

  const update = { $set: req.body };
  const removed = OPTIONAL_FIELDS.filter((field) => req.body[field] === undefined);
  if (removed.length) {
    update.$unset = Object.fromEntries(removed.map((field) => [field, '']));
  }

  const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, UPDATE_OPTIONS);
  if (!recipe) throw new HttpError(404, `Recipe not found: ${req.params.id}`);
  res.status(200).json(recipe);
}

export async function deleteRecipe(req, res) {
  assertObjectId(req.params.id, 'Recipe');
  const removed = await Recipe.findByIdAndDelete(req.params.id);
  if (!removed) throw new HttpError(404, `Recipe not found: ${req.params.id}`);

  // Keep meal plans consistent: drop entries that pointed at this recipe.
  await MealPlan.updateMany(
    { 'entries.recipeId': removed._id },
    { $pull: { entries: { recipeId: removed._id } } },
  );
  res.status(204).end();
}

