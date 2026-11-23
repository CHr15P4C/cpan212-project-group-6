'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SORT_CHOICES, DEFAULTS, buildQuery } from './listOptions';

const controlStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  background: '#fff',
  font: 'inherit',
};
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem' };

// Filter and sort controls for the recipe list. Every change navigates to a
// new URL (page 1 of the new view), and the server page reads that URL, so a
// reload or a shared link shows exactly the same view.
export default function RecipeControls({ initial, categories }) {
  const router = useRouter();

  // The URL may spell the category differently (?category=chicken); show the
  // spelling the dropdown actually offers.
  const canonicalCategory =
    categories.find((name) => name.toLowerCase() === initial.category.toLowerCase()) ?? initial.category;
  const categoryOptions =
    canonicalCategory && !categories.includes(canonicalCategory) ? [canonicalCategory, ...categories] : categories;

  const [search, setSearch] = useState(initial.search);
  const [category, setCategory] = useState(canonicalCategory);
  const [sortChoice, setSortChoice] = useState(`${initial.sort}:${initial.order}`);

  const defaultChoice = `${DEFAULTS.sort}:${DEFAULTS.order}`;
  const isFiltered = Boolean(initial.search || initial.category || sortChoice !== defaultChoice);

  function go(changes) {
    const next = { search, category, sortChoice, ...changes };
    const [sort, order] = next.sortChoice.split(':');
    router.push(`/recipes${buildQuery({ search: next.search.trim(), category: next.category, sort, order, page: 1 })}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        go({});
      }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}
    >
      <div style={{ flex: '2 1 220px' }}>
        <label htmlFor="recipe-search" style={labelStyle}>Search title or ingredient</label>
        <input
          id="recipe-search"
          type="search"
          value={search}
          maxLength={60}
          placeholder="e.g. garlic"
          onChange={(event) => setSearch(event.target.value)}
          style={controlStyle}
        />
      </div>

      <div style={{ flex: '1 1 160px' }}>
        <label htmlFor="recipe-category" style={labelStyle}>Category</label>
        <select
          id="recipe-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            go({ category: event.target.value });
          }}
          style={controlStyle}
        >
          <option value="">All categories</option>
          {categoryOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 170px' }}>
        <label htmlFor="recipe-sort" style={labelStyle}>Sort by</label>
        <select
          id="recipe-sort"
          value={sortChoice}
          onChange={(event) => {
            setSortChoice(event.target.value);
            go({ sortChoice: event.target.value });
          }}
          style={controlStyle}
        >
          {SORT_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>{choice.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', cursor: 'pointer', font: 'inherit' }}
        >
          Search
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={() => router.push('/recipes')}
            style={{ background: '#ecf0f1', color: '#333', border: 'none', padding: '0.55rem 1rem', borderRadius: '4px', cursor: 'pointer', font: 'inherit' }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
