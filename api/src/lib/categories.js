import { getCategories } from "./the-meal-db.js";
import { getCache, setCache } from './cache.js';

export async function getCategoriesCached(){
    const cacheKey = 'categories';

    //check cache
    const cachedEntry = getCache(cacheKey);
    if (cachedEntry) {
        return {
            ...cachedEntry,
            cached: true,
        };
    }
    //on miss
    const fetchedAt = new Date().toISOString();
    const categoriesData = await getCategories();
    const summary = {
        categoriesData,
        fetchedAt,
    };

    setCache(cacheKey, summary);

    return {
        ...summary,
        cached: false,
    };
}