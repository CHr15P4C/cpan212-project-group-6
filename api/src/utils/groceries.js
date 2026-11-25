export function groceries(entries) {
  const items = new Map();

  for (const entry of entries) {
    const batches = entry.batches ?? 1;

    for (const ingredient of entry.recipeId?.ingredients ?? []) {
      const name = ingredient.name.trim();
      const measure = (ingredient.measure || '').trim();

      const match = measure.match(
        /^(\d+(?:\.\d+)?|\d+\/\d+|\d+ \d+\/\d+)(?:\s*([a-zA-Z]+))?$/
      );

      const number = match
        ? match[1].split(' ').reduce((sum, part) => {
            const [a, b] = part.split('/').map(Number);
            return sum + (b === undefined ? a : a / b);
          }, 0)
        : NaN;

      const numeric = Number.isFinite(number);
      const unit = match?.[2]?.toLowerCase() || '';

      const key = JSON.stringify([
        name.toLowerCase(),
        numeric ? 'number' : 'text',
        numeric ? unit : measure.toLowerCase()
      ]);

      const item = items.get(key) || {
        key,
        name,
        unit,
        measure,
        numeric,
        quantity: 0
      };

      item.quantity += (numeric ? number : 1) * batches;

      items.set(key, item);
    }
  }

  return [...items.values()]
    .map(i => ({
      key: i.key,
      name: i.name,
      amount: i.numeric
        ? `${Number(i.quantity.toFixed(4))} ${i.unit}`.trim()
        : `${i.quantity} × ${i.measure || 'unspecified amount'}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
