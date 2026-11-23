import Link from 'next/link';
import { redirect } from 'next/navigation';
import RecipeControls from './RecipeControls';
import { readListParams, buildQuery } from './listOptions';

const API_URL = 'http://localhost:4000/api';
const PAGE_SIZE = 10;

async function getRecipes(params) {
  const query = new URLSearchParams({
    sort: params.sort,
    order: params.order,
    page: String(params.page),
    limit: String(PAGE_SIZE),
  });
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);

  const res = await fetch(`${API_URL}/recipes?${query}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || 'Failed to fetch recipes from API');
  }
  return res.json(); // { items, total, page, limit, totalPages }
}

// The filter dropdown is a nice-to-have: if this fails the page still works.
async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/recipes/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.categories) ? data.categories : [];
  } catch {
    return [];
  }
}

const pagerLink = {
  padding: '0.4rem 0.9rem',
  borderRadius: '4px',
  border: '1px solid #3498db',
  color: '#2980b9',
  textDecoration: 'none',
  background: '#fff',
};
const pagerDisabled = { ...pagerLink, border: '1px solid #ddd', color: '#aaa' };

function Pager({ params, page, totalPages }) {
  const href = (target) => `/recipes${buildQuery({ ...params, page: target })}`;
  return (
    <nav
      aria-label="Recipe pages"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} style={pagerLink}>&larr; Previous</Link>
      ) : (
        <span aria-disabled="true" style={pagerDisabled}>&larr; Previous</span>
      )}
      <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link href={href(page + 1)} style={pagerLink}>Next &rarr;</Link>
      ) : (
        <span aria-disabled="true" style={pagerDisabled}>Next &rarr;</span>
      )}
    </nav>
  );
}

export default async function RecipesPage({ searchParams }) {
  const params = readListParams(await searchParams);
  const [data, categories] = await Promise.all([getRecipes(params), getCategories()]);

  // A reloaded or shared link can point past the last page (for example after
  // recipes were deleted). Go to the last page instead of showing nothing.
  if (params.page > data.totalPages) {
    redirect(`/recipes${buildQuery({ ...params, page: data.totalPages })}`);
  }

  const { items, total, page, limit, totalPages } = data;
  const isFiltered = Boolean(params.search || params.category);
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = first + items.length - 1;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Recipe Library</h2>
        <Link href="/recipes/new" style={{ background: '#27ae60', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none' }}>
          Create Recipe
        </Link>
      </div>

      {/* key: remount the controls when the URL changes (back/forward, Clear) so they match it */}
      <RecipeControls key={buildQuery({ ...params, page: 1 })} initial={params} categories={categories} />

      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {total === 0
          ? 'No recipes to show.'
          : `Showing ${first}–${last} of ${total} ${total === 1 ? 'recipe' : 'recipes'}${isFiltered ? ' matching your filters' : ''}`}
      </p>

      {items.length === 0 ? (
        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
          {isFiltered ? (
            <>No recipes match these filters. <Link href="/recipes" style={{ color: '#2980b9' }}>Clear filters</Link></>
          ) : (
            'No recipes found. Create your first one!'
          )}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
          {items.map((recipe) => (
            <li key={recipe.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  <Link href={`/recipes/${recipe.id}`} style={{ color: '#2980b9', textDecoration: 'none' }}>
                    {recipe.title}
                  </Link>
                </h3>
                <span style={{ background: '#ecf0f1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {recipe.category || 'Uncategorized'} {recipe.area ? `• ${recipe.area}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href={`/recipes/${recipe.id}/edit`} style={{ color: '#e67e22', textDecoration: 'none', fontWeight: 'bold' }}>
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && <Pager params={params} page={page} totalPages={totalPages} />}
    </div>
  );
}
