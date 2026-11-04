'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h3 style={{ color: '#c0392b' }}>Failed to load recipes</h3>
      <p style={{ color: '#7f8c8d' }}>{error.message || 'Could not connect to the API server.'}</p>
      <button onClick={() => reset()} style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  );
}