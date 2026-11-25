'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanTools({ id }) {
  const router = useRouter();

  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');

    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function request(path, options) {
    const res = await fetch(
      `/api/mealplans/${id}${path}`,
      options
    );

    if (!res.ok) {
      throw new Error('Request failed. Please try again.');
    }

    return res.status === 204 ? null : res.json();
  }

  return (
    <section style={{ marginBottom: 16 }}>

      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }}>

        <button
          disabled={busy}
          onClick={() => run(async () => {
            if (!window.confirm('Delete this meal plan?')) {
              return;
            }

            await request('', { method: 'DELETE' });
            router.refresh();
          })}
          style={{
            background: '#e74c3c',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Delete Plan
        </button>

        <button
          disabled={busy}
          onClick={() =>
            items
              ? setItems(null)
              : run(async () =>
                  setItems(await request('/groceries'))
                )
          }
          style={{
            background: '#27ae60',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {items ? 'Hide' : 'Generate'} Grocery List
        </button>

      </div>

      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {items && (
        <div style={{
          background: '#f8f9fa',
          padding: 16,
          marginTop: 12,
          borderRadius: 8
        }}>

          <h4>
            Shopping Checklist
            ({items.filter(i => i.checked).length}
            /{items.length})
          </h4>

          {!items.length && (
            <p>No ingredients in this plan.</p>
          )}

          {items.map(item => (
            <label
              key={item.key}
              style={{
                display: 'block',
                padding: 6,
                textDecoration: item.checked
                  ? 'line-through'
                  : 'none'
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                disabled={busy}
                onChange={e => {
                  const checked = e.target.checked;

                  run(async () => {
                    await request('/groceries', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        key: item.key,
                        checked
                      })
                    });

                    setItems(old =>
                      old.map(x =>
                        x.key === item.key
                          ? { ...x, checked }
                          : x
                      )
                    );
                  });
                }}
              />

              {' '}{item.name} — {item.amount}

            </label>
          ))}

        </div>
      )}

    </section>
  );
}
