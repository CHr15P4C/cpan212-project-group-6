import Link from 'next/link';

async function getMealPlans() {
  const res = await fetch('http://localhost:4000/api/mealplans', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch meal plans');
  return res.json();
}

async function getRecipe(id) {
  try {
    const res = await fetch(`http://localhost:4000/api/recipes/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function MealPlansPage() {
  const mealPlans = await getMealPlans();

  const recipeIds = [...new Set(mealPlans.flatMap((plan) => plan.entries.map((e) => e.recipeId)))];
  const recipePromises = recipeIds.map(async (id) => {
    const recipe = await getRecipe(id);
    return [id, recipe];
  });

  const recipeMap = Object.fromEntries(await Promise.all(recipePromises));

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Meal Plans</h2>
        <Link href="/mealplans/new" style={{ background: '#27ae60', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none' }}>
          + Create Meal Plan
        </Link>
      </div>
      
      {mealPlans.length === 0 ? (
        <p style={{ color: '#7f8c8d' }}>No meal plans configured.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
          {mealPlans.map((plan) => (
            <li key={plan.id} style={{ border: '1px solid #ddd', padding: '1.25rem', borderRadius: '8px', background: '#fff' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>
                {plan.name}{' '}
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'normal' }}>
                  (Week of {plan.weekStart})
                </span>
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {plan.entries.map((entry, idx) => {
                  const recipe = recipeMap[entry.recipeId];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8f9fa',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            color: '#e67e22',
                            display: 'inline-block',
                            width: '95px',
                          }}
                        >
                          {entry.day} ({entry.mealType})
                        </span>
                        {entry.notes && (
                          <span style={{ color: '#6c757d', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                            — "{entry.notes}"
                          </span>
                        )}
                      </div>

                      {recipe ? (
                        <Link
                          href={`/recipes/${recipe.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            background: '#fff',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          {recipe.imageUrl && (
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '0.95rem' }}>
                              {recipe.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                              {recipe.category || 'Recipe'} {recipe.area ? `• ${recipe.area}` : ''}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <span style={{ color: '#e74c3c', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          Recipe not found
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}