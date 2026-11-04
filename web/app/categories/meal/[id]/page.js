import { notFound } from 'next/navigation';
import Link from 'next/link';
import SaveButton from './SaveButton';

async function getExternalMealDetail(id) {
  const res = await fetch(`http://localhost:4000/api/external/meals?q=${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  return data.results[0];
}

export default async function ExternalMealDetailPage({ params }) {
  const { id } = await params;
  const recipe = await getExternalMealDetail(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <Link href="/categories" style={{ color: '#7f8c8d', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Categories</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <h2>{recipe.title}</h2>
        <SaveButton recipe={recipe} />
      </div>

      <p style={{ color: '#7f8c8d' }}>
        Category: <strong>{recipe.category || 'None'}</strong> {recipe.area ? `| Area: ${recipe.area}` : ''}
      </p>

      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt={recipe.title} style={{ maxWidth: '300px', borderRadius: '6px', margin: '1rem 0' }} />
      )}

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ing, idx) => (
          <li key={idx}>
            {ing.measure ? `${ing.measure} ` : ''}{ing.name}
          </li>
        ))}
      </ul>

      <h3>Instructions</h3>
      <p style={{ whiteSpace: 'pre-line', background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
        {recipe.instructions}
      </p>
    </div>
  );
}