import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <h1>Recipe & Meal Planner</h1>
      <p className={styles.lead}>
        Browse homemade recipes, search external MealDB catalogs, and manage your weekly culinary schedule.
      </p>
      <ol className={styles.steps}>
        <li>
          Explore the <Link href="/recipes">recipes list</Link> to view, filter, or manage existing dishes.
        </li>
        <li>Open any recipe to inspect its ingredients, measures, and cooking instructions.</li>
        <li>
          Looking for inspiration? Search the <Link href="/external">external MealDB catalog</Link>.
        </li>
        <li>
          Created a new dish? <Link href="/recipes/new">Add a custom recipe</Link> to your collection.
        </li>
      </ol>
    </>
  );
}