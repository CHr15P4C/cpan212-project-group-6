import Link from 'next/link';
import styles from './RecipeCard.module.css';

export default function RecipeCard({ recipe }) {
  return (
    <article className={styles.card}>
      {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className={styles.image} />}
      <p className={styles.category}>{recipe.category || 'General'}</p>
      <h2 className={styles.title}>
        <Link href={'/recipes/' + recipe.id}>{recipe.title}</Link>
      </h2>
      <p className={styles.meta}>
        {recipe.area ? `${recipe.area} Cuisine` : 'Custom Recipe'}
      </p>
    </article>
  );
}