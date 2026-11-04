'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function CreateRecipePage() {
  const router = useRouter();
  const { showNotification } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', measure: '' }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', measure: '' }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
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
          alert(data.error?.message || 'Failed to create recipe');
        }
        setIsSubmitting(false);
        return;
      }

      showNotification('Recipe created successfully!');
      router.push(`/recipes/${data.id}`);
    } catch (err) {
      alert('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2>Create New Recipe</h2>
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
            {fieldErrors.category && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.category}</span>}
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Area (Cuisine)</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Ingredients</label>
          {ingredients.map((ing, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ingredient name"
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                style={{ flex: 2, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Measure (e.g. 1 cup)"
                value={ing.measure}
                onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)}
                style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          ))}
          {fieldErrors.ingredients && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.ingredients}</span>}
          <button type="button" onClick={handleAddIngredient} style={{ background: '#ecf0f1', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', marginTop: '0.3rem' }}>
            + Add Ingredient
          </button>
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
          style={{ background: isSubmitting ? '#95a5a6' : '#27ae60', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>
    </div>
  );
}