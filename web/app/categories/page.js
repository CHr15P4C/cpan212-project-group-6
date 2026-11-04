import Link from 'next/link';

async function getCategories() {
  const res = await fetch('http://localhost:4000/api/external/categories', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch external categories');
  return res.json();
}

export default async function CategoriesPage() {
  const data = await getCategories();
  const categories = data.categories || [];

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2>External Meal Categories (TheMealDB)</h2>
      <p style={{ color: '#7f8c8d' }}>Explore meals fetched through your Express API from TheMealDB.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            style={{ border: '1px solid #3498db', color: '#3498db', padding: '1rem', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}