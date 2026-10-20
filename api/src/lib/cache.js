import { config } from '../config.js';
//setting up the cache
const cache = new Map();
let hits = 0;
let misses = 0;
const ttlMs = config.cacheTtlSeconds * 1000;
//function to kill expired cache entries so theres no memory leak
function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

export function getCache(key) {
  purgeExpired();
  const entry = cache.get(key);
  if (!entry) {
    misses++;
    return null;
  }
  hits++;
  return entry.value;
}
//set cache 
export function setCache(key, value) {
  purgeExpired();
  const expiresAt = Date.now() + ttlMs;
  cache.set(key, { value, expiresAt });
}
//return cache stats for cache routes
export function getCacheStats() {
  purgeExpired();
  return {
    entries: cache.size,
    hits,
    misses,
    ttlSeconds: config.cacheTtlSeconds,
  };
}