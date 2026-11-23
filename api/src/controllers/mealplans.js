import mongoose from 'mongoose';
import { MealPlan } from '../models/MealPlan.js';
import { Recipe } from '../models/Recipe.js';
import { HttpError } from '../utils/HttpError.js';
import { assertObjectId, isObjectId } from '../utils/ids.js';

const UPDATE_OPTIONS = { returnDocument: 'after', runValidators: true };

// Related data: replace each entry's recipeId with a summary of the recipe.
// Every endpoint that returns a meal plan uses this, so the shape is the same
// everywhere: entries[i].recipeId = { id, title, category, area, imageUrl }.
const POPULATE_RECIPES = { path: 'entries.recipeId', select: 'title category area imageUrl' };

// Every entry must point at a recipe that exists.
async function assertRecipesExist(entries) {
  const wanted = [...new Set(entries.filter((e) => isObjectId(e.recipeId)).map((e) => e.recipeId.toLowerCase()))];

  // mongoose.trusted(): sanitizeFilter is on, and it would otherwise treat our
  // own $in as untrusted input and neutralise it.
  const found = wanted.length
    ? await Recipe.find({ _id: mongoose.trusted({ $in: wanted }) }).select('_id')
    : [];
  const existing = new Set(found.map((recipe) => recipe.id));

  const problems = [];
  entries.forEach((entry, i) => {
    if (!isObjectId(entry.recipeId) || !existing.has(entry.recipeId.toLowerCase())) {
      problems.push({ field: `entries.${i}.recipeId`, message: `Recipe not found: ${entry.recipeId}` });
    }
  });
  if (problems.length) throw new HttpError(400, 'Validation failed', problems);
}

export async function listMealPlans(req, res) {
  const plans = await MealPlan.find().sort({ weekStart: -1, _id: -1 }).populate(POPULATE_RECIPES);
  res.status(200).json(plans);
}

export async function getMealPlan(req, res) {
  assertObjectId(req.params.id, 'Meal plan');
  const plan = await MealPlan.findById(req.params.id).populate(POPULATE_RECIPES);
  if (!plan) throw new HttpError(404, `Meal plan not found: ${req.params.id}`);
  res.status(200).json(plan);
}

export async function createMealPlan(req, res) {
  await assertRecipesExist(req.body.entries);
  const plan = await MealPlan.create(req.body);
  await plan.populate(POPULATE_RECIPES);
  res.status(201).json(plan);
}

export async function updateMealPlan(req, res) {
  const { id } = req.params;
  assertObjectId(id, 'Meal plan');
  if (!(await MealPlan.exists({ _id: id }))) {
    throw new HttpError(404, `Meal plan not found: ${id}`);
  }
  await assertRecipesExist(req.body.entries);

  // The body always has name, weekStart and entries, so $set replaces them all.
  const plan = await MealPlan.findByIdAndUpdate(id, { $set: req.body }, UPDATE_OPTIONS).populate(POPULATE_RECIPES);
  if (!plan) throw new HttpError(404, `Meal plan not found: ${id}`);
  res.status(200).json(plan);
}

export async function deleteMealPlan(req, res) {
  assertObjectId(req.params.id, 'Meal plan');
  const removed = await MealPlan.findByIdAndDelete(req.params.id);
  if (!removed) throw new HttpError(404, `Meal plan not found: ${req.params.id}`);
  res.status(204).end();
}
