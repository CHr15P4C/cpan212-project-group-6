'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function CreateMealPlanPage() {
  const router = useRouter();
  const { showNotification } = useApp();

  const [name, setName] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [entries, setEntries] = useState([
    { day: 'Mon', mealType: 'dinner', recipeId: '', notes: '' },
  ]);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/recipes')
      .then((res) => res.json())
      .then((data) => {
        setRecipes(Array.isArray(data) ? data : []);
        setLoadingRecipes(false);
      })
      .catch(() => {
        setLoadingRecipes(false);
      });
  }, []);

  const handleAddEntry = () => {
    setEntries([...entries, { day: 'Mon', mealType: 'dinner', recipeId: recipes[0]?.id || '', notes: '' }]);
  };

  const handleRemoveEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const res = await fetch('/api/mealplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, weekStart, entries }),
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
          alert(data.error?.message || 'Failed to create meal plan');
        }
        setIsSubmitting(false);
        return;
      }

      showNotification('Meal plan created successfully!');
      router.push('/mealplans');
    } catch (err) {
      alert('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2>Create New Meal Plan</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '700px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Plan Name</label>
          <input
            type="text"
            placeholder="e.g. Week of Nov 2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {fieldErrors.name && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.name}</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Week Start Date (YYYY-MM-DD)</label>
          <input
            type="text"
            placeholder="2026-11-02"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {fieldErrors.weekStart && <span style={{ color: 'red', fontSize: '0.85rem' }}>{fieldErrors.weekStart}</span>}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Meal Plan Entries</label>
            <button
              type="button"
              onClick={handleAddEntry}
              style={{ background: '#ecf0f1', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + Add Entry
            </button>
          </div>

          {fieldErrors.entries && <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{fieldErrors.entries}</div>}

          {entries.map((entry, index) => {
            const recipeIdError = fieldErrors[`entries.${index}.recipeId`];
            return (
              <div key={index} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', background: '#f8f9fa', marginBottom: '1rem', display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>Day</label>
                    <select
                      value={entry.day}
                      onChange={(e) => handleEntryChange(index, 'day', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>Meal Type</label>
                    <select
                      value={entry.mealType}
                      onChange={(e) => handleEntryChange(index, 'mealType', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {MEAL_TYPES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>Recipe</label>
                  {loadingRecipes ? (
                    <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Loading local recipes...</p>
                  ) : recipes.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'red' }}>No recipes available. Please create a recipe first.</p>
                  ) : (
                    <select
                      value={entry.recipeId}
                      onChange={(e) => handleEntryChange(index, 'recipeId', e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="">-- Select a Recipe --</option>
                      {recipes.map((r) => (
                        <option key={r.id} value={r.id}>{r.title} ({r.category || 'General'})</option>
                      ))}
                    </select>
                  )}
                  {recipeIdError && <span style={{ color: 'red', fontSize: '0.8rem' }}>{recipeIdError}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Double the chilli"
                    value={entry.notes}
                    onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(index)}
                    style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', justifySelf: 'start', fontSize: '0.8rem' }}
                  >
                    Remove Entry
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: isSubmitting ? '#95a5a6' : '#27ae60', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Saving Meal Plan...' : 'Save Meal Plan'}
        </button>
      </form>
    </div>
  );
}