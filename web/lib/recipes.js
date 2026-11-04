const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:4000';

export async function getRecipes(query = '') {
  const url = query ? `${API_ORIGIN}/api/recipes?search=${encodeURIComponent(query)}` : `${API_ORIGIN}/api/recipes`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('The API answered ' + res.status + ' when loading recipes');
  return res.json();
}

export async function getRecipeById(id) {
  const res = await fetch(`${API_ORIGIN}/api/recipes/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('The API answered ' + res.status + ' when loading recipe ' + id);
  return res.json();
}