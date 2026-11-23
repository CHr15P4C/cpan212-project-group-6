// True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-31).
export function isRealDate(s) {
  if (typeof s !== 'string') return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}
