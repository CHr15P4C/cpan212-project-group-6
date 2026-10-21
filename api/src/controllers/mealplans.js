import { randomUUID } from 'node:crypto';
import { mealPlans, recipes } from '../data/store.js';
import { HttpError } from '../utils/HttpError.js';

function findIndexOrThrow(id) {
  const index = mealPlans.findIndex((p) => p.id === id);
  if (index === -1) throw new HttpError(404, `Meal plan not found: ${id}`);
  return index;
}

// Every entry must point at a recipe that exists.
function assertRecipesExist(entries) {
  const problems = [];
  entries.forEach((entry, i) => {
    if (!recipes.some((r) => r.id === entry.recipeId)) {
      problems.push({ field: `entries.${i}.recipeId`, message: `Recipe not found: ${entry.recipeId}` });
    }
  });
  if (problems.length) throw new HttpError(400, 'Validation failed', problems);
}

export function listMealPlans(req, res) {
  res.status(200).json(mealPlans);
}

export function getMealPlan(req, res) {
  res.status(200).json(mealPlans[findIndexOrThrow(req.params.id)]);
}

export function createMealPlan(req, res) {
  assertRecipesExist(req.body.entries);
  const timestamp = new Date().toISOString();
  const plan = { id: randomUUID(), ...req.body, createdAt: timestamp, updatedAt: timestamp };
  mealPlans.push(plan);
  res.status(201).json(plan);
}

export function updateMealPlan(req, res) {
  const index = findIndexOrThrow(req.params.id);
  assertRecipesExist(req.body.entries);
  const existing = mealPlans[index];
  const updated = {
    id: existing.id,
    ...req.body,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  mealPlans[index] = updated;
  res.status(200).json(updated);
}

export function deleteMealPlan(req, res) {
  const index = findIndexOrThrow(req.params.id);
  mealPlans.splice(index, 1);
  res.status(204).end();
}
