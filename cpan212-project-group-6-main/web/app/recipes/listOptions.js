// Shared by the recipes list page (server) and its controls (client).
// The URL query string is the single source of truth for the list view:
//   /recipes?search=garlic&category=Chicken&sort=title&order=asc&page=2

export const DEFAULTS = { sort: 'createdAt', order: 'desc' };

// Every sort the API allows, in both directions. value = "<sort>:<order>".
export const SORT_CHOICES = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'title:desc', label: 'Title Z–A' },
  { value: 'category:asc', label: 'Category A–Z' },
  { value: 'category:desc', label: 'Category Z–A' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'updatedAt:asc', label: 'Least recently updated' },
];

const VALID_SORTS = new Set(SORT_CHOICES.map((choice) => choice.value));

// Next gives searchParams values as string | string[] | undefined. Read them
// defensively so a hand-edited URL (?sort=nonsense, ?page=abc) falls back to
// the defaults instead of breaking the page.
export function readListParams(raw = {}) {
  const text = (value) => {
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === 'string' ? first.trim() : '';
  };

  let sort = text(raw.sort) || DEFAULTS.sort;
  let order = text(raw.order) || DEFAULTS.order;
  if (!VALID_SORTS.has(`${sort}:${order}`)) {
    sort = DEFAULTS.sort;
    order = DEFAULTS.order;
  }

  const page = Number.parseInt(text(raw.page), 10);
  return {
    search: text(raw.search).slice(0, 60),
    category: text(raw.category).slice(0, 60),
    sort,
    order,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

// Build the query string for a view ("" or "?a=b&c=d"). Defaults are left out
// so the plain list keeps the plain URL /recipes.
export function buildQuery({ search, category, sort, order, page }) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (category) query.set('category', category);
  if (sort !== DEFAULTS.sort || order !== DEFAULTS.order) {
    query.set('sort', sort);
    query.set('order', order);
  }
  if (page > 1) query.set('page', String(page));
  const text = query.toString();
  return text ? `?${text}` : '';
}
