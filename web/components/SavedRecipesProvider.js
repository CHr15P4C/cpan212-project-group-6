'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'recipe-planner:saved-ids';
const SavedRecipesContext = createContext(null);

export function SavedRecipesProvider({ children }) {
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedIds(JSON.parse(stored));
    }
  }, []);

  function isSaved(recipeId) {
    return savedIds.includes(recipeId);
  }

  function toggleSaved(recipeId) {
    let nextIds;
    if (savedIds.includes(recipeId)) {
      nextIds = savedIds.filter((id) => id !== recipeId);
    } else {
      nextIds = savedIds.concat(recipeId);
    }
    setSavedIds(nextIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
  }

  const value = { savedIds, isSaved, toggleSaved };

  return <SavedRecipesContext.Provider value={value}>{children}</SavedRecipesContext.Provider>;
}

export function useSavedRecipes() {
  return useContext(SavedRecipesContext);
}