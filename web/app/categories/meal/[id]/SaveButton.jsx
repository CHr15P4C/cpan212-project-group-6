'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function SaveRecipeButton({ recipe }) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { showNotification } = useApp();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: recipe.title,
        category: recipe.category || undefined,
        area: recipe.area || undefined,
        instructions: recipe.instructions || '',
        imageUrl: recipe.imageUrl || undefined,
        sourceMealId: recipe.sourceMealId || undefined,
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          measure: i.measure || '',
        })),
      };

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error?.message || 'Failed to save recipe locally');
        setIsSaving(false);
        return;
      }

      showNotification('Recipe saved to local library successfully!');
      router.push(`/recipes/${data.id}`);
    } catch (err) {
      alert('An unexpected error occurred while saving.');
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      style={{
        background: isSaving ? '#95a5a6' : '#27ae60',
        color: '#fff',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: isSaving ? 'not-allowed' : 'pointer',
        marginTop: '1rem',
        display: 'inline-block',
      }}
    >
      {isSaving ? 'Saving...' : '💾 Save to Local Recipes'}
    </button>
  );
}