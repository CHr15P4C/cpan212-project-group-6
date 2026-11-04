import Link from 'next/link';

async function getMealsByCategory(categoryname) {
  const res = await fetch(`http://localhost:4000/api/external/categories/${encodeURIComponent(categoryname)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recipes for category');
  return res.json();
}

export default async function CategoryMealsPage({ params }) {
  const { categoryname } = await params;
  const data = await getMealsByCategory(categoryname);
  const meals = data.results || [];

  return (
    <div style={{ padding: '2rem 0' }}>
      <Link href="/categories" style={{ color: '#7f8c8d', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Categories</Link>
      <h2 style={{ marginTop: '1rem' }}>Category: {categoryname}</h2>

      {meals.length === 0 ? (
        <p style={{ color: '#7f8c8d' }}>No meals found in this category.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {meals.map((meal) => (
            <Link
              key={meal.sourceMealId}
              href={`/categories/meal/${meal.sourceMealId}`}
              style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff' }}
            >
              {meal.imageUrl && (
                <img src={meal.imageUrl} alt={meal.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#2980b9' }}>{meal.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}