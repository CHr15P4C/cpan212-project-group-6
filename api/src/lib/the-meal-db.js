import { config } from '../config.js';
import { HttpError } from './http-error.js';

//fetch error handling from a1
async function fetchJson(url) {
  let res;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs)
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, `The meal db did not respond within ${config.upstreamTimeoutMs} ms`);
    }
    throw new HttpError(502, 'Could not get a valid response from the meal db');
  }

  if (!res.ok) {
    throw new HttpError(502, 'Could not get a valid response from the meal db');
  }

  try {
    return await res.json();
  } catch (err) {
    throw new HttpError(502, 'Could not get a valid response from the meal db');
  }
}

//function to get meal categories
export async function getCategories() {
    const url = `${config.mealDBUrl}/${config.devKey}/categories.php`;
    //const url = `https://www.themealdb.com/api/json/v1/1/categories.php`
    const data = await fetchJson(url);

    if (!data.categories || data.categories.length === 0) {
    throw new HttpError(404, `:No Categories Found`);
  }

  return data;

}