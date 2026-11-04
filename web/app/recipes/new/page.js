'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '../../../lib/categories';
import styles from './page.module.css';



export default function NewRecipePage() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const newRecipe = {
      title: form.get('title'),
      category: form.get('category'),
      area: form.get('area'),
      instructions: form.get('instructions'),
      ingredients: [{ name: form.get('ingredientName'), measure: form.get('ingredientMeasure') }],
    };

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe),
      });
      const body = await res.json();

      if (!res.ok) {
        if (body.error?.details) {
          setErrors(
            body.error.details.reduce((acc, curr) => ({ ...acc, [curr.field]: curr.message }), {})
          );
        }
        setMessage(body.error?.message || 'Validation failed');
        setSubmitting(false);
        return;
      }

      router.push('/recipes/' + body.id);
    } catch (err) {
      setMessage('Could not reach the recipes API. Check that it is running on port 4000.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>New Recipe</h1>
      {message && <div role="alert" className={styles.summary}><p>{message}</p></div>}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
          {errors.title && <p className={styles.error}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue="">
            <option value="">Choose category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="ingredientName">Main Ingredient</label>
          <input id="ingredientName" name="ingredientName" placeholder="e.g. chicken breast" />
        </div>

        <div className={styles.field}>
          <label htmlFor="ingredientMeasure">Measure</label>
          <input id="ingredientMeasure" name="ingredientMeasure" placeholder="e.g. 2 cups" />
        </div>

        <div className={styles.field}>
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" name="instructions" rows={4} />
          {errors.instructions && <p className={styles.error}>{errors.instructions}</p>}
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Recipe'}
        </button>
      </form>
    </>
  );
}