import Link from 'next/link';
import { getRecipes } from '@/lib/recipes';
import CategoryFilter from '@/components/CategoryFilter';

export const metadata = {
  title: 'Recipes',
};

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <>
      <h1>Recipes</h1>
      <p>
        <Link href="/recipes/new">Add a new recipe</Link>
      </p>
      {recipes.length === 0 ? (
        <p>No recipes found. Try adding one!</p>
      ) : (
        <CategoryFilter recipes={recipes} />
      )}
    </>
  );
}