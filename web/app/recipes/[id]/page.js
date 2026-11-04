import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipeById } from '../../../lib/recipes';
import styles from './page.module.css';

export default async function RecipePage({ params }) {
  const routeParams = await params;
  const recipe = await getRecipeById(routeParams.id);

  if (!recipe) {
    notFound();
  }

  return (
    <article>
      <p className={styles.back}>
        <Link href="/recipes">Back to all recipes</Link> | <Link href={`/recipes/${recipe.id}/edit`}>Edit recipe</Link>
      </p>
      {recipe.imageUrl && (
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem' }} 
        />
      )}
      <p className={styles.category}>{recipe.category}</p>
      <h1 className={styles.title}>{recipe.title}</h1>
      {recipe.area && <p><strong>Area:</strong> {recipe.area}</p>}
      
      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ing, index) => (
          <li key={index}>
            {ing.measure ? `${ing.measure} ` : ''}{ing.name}
          </li>
        ))}
      </ul>

      <h3>Instructions</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{recipe.instructions}</p>
    </article>
  );
}