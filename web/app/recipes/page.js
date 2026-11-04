import Link from 'next/link';

async function getRecipes() {
  const res = await fetch('http://localhost:4000/api/recipes', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recipes from API');
  return res.json();
}

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Recipe Library</h2>
        <Link href="/recipes/new" style={{ background: '#27ae60', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none' }}>
          Create Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No recipes found. Create your first one!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
          {recipes.map((recipe) => (
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
    </div>
  );
}