'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function EditRecipePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { showNotification } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || '');
        setCategory(data.category || '');
        setArea(data.area || '');
        setInstructions(data.instructions || '');
        setIngredients(data.ingredients || []);
        setLoading(false);
      })
      .catch(() => {
        alert('Failed to load recipe');
        router.push('/recipes');
      });
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, area, instructions, ingredients }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error?.details) {
          const errorsObj = {};
          data.error.details.forEach((err) => {
            errorsObj[err.field] = err.message;
          });
          setFieldErrors(errorsObj);
        } else {
          alert(data.error?.message || 'Failed to update recipe');
        }
        setIsSubmitting(false);
        return;
      }

      showNotification('Recipe updated successfully!');
      router.push(`/recipes/${id}`);
    } catch (err) {
      alert('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading recipe...</div>;

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2>Edit Recipe</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {fieldErrors.title && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.title}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Area</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Instructions</label>
          <textarea
            rows={5}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {fieldErrors.instructions && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.instructions}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: isSubmitting ? '#95a5a6' : '#e67e22', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Updating...' : 'Update Recipe'}
        </button>
      </form>
    </div>
  );
}