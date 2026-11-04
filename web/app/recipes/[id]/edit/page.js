'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import styles from '../new/page.module.css';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [recipe, setRecipe] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recipes/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load recipe')))
      .then((data) => setRecipe(data))
      .catch((err) => setMessage(err));
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const updatedRecipe = {
      title: form.get('title'),
      category: form.get('category'),
      instructions: form.get('instructions'),
      ingredients: recipe.ingredients, // preserves existing or can be bound to inputs
    };

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe),
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

      router.push('/recipes/' + id);
    } catch (err) {
      setMessage('Could not reach the recipes API.');
      setSubmitting(false);
    }
  }

  if (!recipe && !message) return <p role="status">Loading recipe for editing...</p>;
  if (message && !recipe) return <p role="alert">{message}</p>;

  return (
    <>
      <h1>Edit Recipe</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={recipe.title} />
          {errors.title && <p className={styles.error}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={recipe.category || ''}>
            <option value="">Choose category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" name="instructions" rows={4} defaultValue={recipe.instructions} />
        </div>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </>
  );
}