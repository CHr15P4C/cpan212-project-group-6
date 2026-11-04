'use client';

import RecipeCard from './RecipeCard';
import styles from './CategoryFilter.module.css';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

export default function CategoryFilter({ recipes }) {
  const [category, setCategory] = useState('all');

  let visibleRecipes = recipes;
  if (category !== 'all') {
    visibleRecipes = recipes.filter((recipe) => recipe.category?.toLowerCase() === category.toLowerCase());
  }

  const options = ['all'].concat(CATEGORIES);

  return (
    <section>
      <div className={styles.options} role="group" aria-label="Filter by category">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.option}
            aria-pressed={option === category}
            onClick={() => setCategory(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        Showing {visibleRecipes.length} of {recipes.length} recipes
      </p>

      <ul className={styles.grid}>
        {visibleRecipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  );
}