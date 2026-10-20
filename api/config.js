function readWholeNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    // Stop at startup instead of running with a timeout of NaN.
    throw new Error(`${name} must be a whole number of 1 or more, got "${raw}"`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 4000,
  geocodingUrl: process.env.THEMEALDBURL || 'https://www.themealdb.com/api/json/v1',
  devKey: process.env.DEVKEY || '/1',
  upstreamTimeoutMs: readWholeNumber('UPSTREAM_TIMEOUT_MS', 5000),
  cacheTtlSeconds: readWholeNumber('CACHE_TTL_SECONDS', 600),
};