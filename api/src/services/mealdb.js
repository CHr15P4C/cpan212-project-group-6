import { HttpError } from '../utils/HttpError.js';

// Settings come from the environment (see .env.example). The API key is
// read from .env only and is never written in the code.
const BASE_URL = process.env.THEMEALDB_BASE_URL ?? 'https://www.themealdb.com/api/json/v1';
const TIMEOUT_MS = Number(process.env.EXTERNAL_TIMEOUT_MS ?? 5000);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 5 * 60 * 1000);
const MAX_CACHE_ENTRIES = 100;

// key -> { value, expiresAt }
const cache = new Map();

// TheMealDB gives numbered fields (strIngredient1..20). Turn them into a clean array.
function toIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (name) out.push({ name, measure: (meal[`strMeasure${i}`] ?? '').trim() });
  }
  return out;
}

// Our own response shape, not the raw TheMealDB one.
function toMeal(meal) {
  return {
    sourceMealId: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory ?? null,
    area: meal.strArea ?? null,
    instructions: meal.strInstructions ?? '',
    imageUrl: meal.strMealThumb ?? null,
    ingredients: toIngredients(meal),
  };
}

async function fetchFromMealDb(query) {
  const key = process.env.THEMEALDB_API_KEY;
  if (!key) {
    throw new HttpError(500, 'Server is missing THEMEALDB_API_KEY (copy .env.example to .env)');
  }
  const url = `${BASE_URL}/${encodeURIComponent(key)}/search.php?s=${encodeURIComponent(query)}`;

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, `TheMealDB did not answer within ${TIMEOUT_MS} ms`);
    }
    throw new HttpError(502, 'Could not reach TheMealDB');
  }

  if (!response.ok) {
    throw new HttpError(502, `TheMealDB returned status ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, 'TheMealDB returned a reply we could not read');
  }

  // TheMealDB returns { meals: null } when nothing matches.
  const meals = Array.isArray(data?.meals) ? data.meals : [];
  return meals.map(toMeal);
}

export async function searchMeals(query) {
  const cacheKey = query.toLowerCase();
  const hit = cache.get(cacheKey);

  if (hit && hit.expiresAt > Date.now()) {
    console.log(`[cache] HIT  meals search "${cacheKey}"`);
    return hit.value;
  }
  cache.delete(cacheKey);

  console.log(`[cache] MISS meals search "${cacheKey}" -> calling TheMealDB`);
  const value = await fetchFromMealDb(query);

  if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}
