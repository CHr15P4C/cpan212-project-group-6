import { randomUUID } from 'node:crypto';
import { recipes, mealPlans } from '../data/store.js';
import { HttpError } from '../utils/HttpError.js';

function findIndexOrThrow(id) {
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) throw new HttpError(404, `Recipe not found: ${id}`);
  return index;
}

export function listRecipes(req, res) {
  const { category } = req.query;
  const result =
    typeof category === 'string' && category.trim()
      ? recipes.filter((r) => r.category?.toLowerCase() === category.trim().toLowerCase())
      : recipes;
  res.status(200).json(result);
}

export function getRecipe(req, res) {
  res.status(200).json(recipes[findIndexOrThrow(req.params.id)]);
}

export function createRecipe(req, res) {
  const timestamp = new Date().toISOString();
  const recipe = { id: randomUUID(), ...req.body, createdAt: timestamp, updatedAt: timestamp };
  recipes.push(recipe);
  res.status(201).json(recipe);
}

export function updateRecipe(req, res) {
  const index = findIndexOrThrow(req.params.id);
  const existing = recipes[index];
  const updated = {
    id: existing.id,
    ...req.body,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  recipes[index] = updated;
  res.status(200).json(updated);
}

export function deleteRecipe(req, res) {
  const index = findIndexOrThrow(req.params.id);
  const [removed] = recipes.splice(index, 1);
  // Keep meal plans consistent: drop entries that pointed at this recipe.
  for (const plan of mealPlans) {
    plan.entries = plan.entries.filter((e) => e.recipeId !== removed.id);
  }
  res.status(204).end();
}
