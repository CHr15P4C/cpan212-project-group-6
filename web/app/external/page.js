'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ExternalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/external/meals?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('External API search failed');
      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError('Could not fetch meals from TheMealDB.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Search External MealDB Catalog</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes (e.g., Arrabiata)..."
          style={{ padding: '0.5rem', width: '20rem', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Search</button>
      </form>

      {loading && <p role="status">Searching external catalog...</p>}
      {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}

      {results && (
        <ul>
          {results.map((meal) => (
            <li key={meal.sourceMealId} style={{ marginBottom: '1rem' }}>
              <strong>{meal.title}</strong> ({meal.category} / {meal.area})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}