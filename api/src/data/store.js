import { randomUUID } from 'node:crypto';

// In-memory "database". Everything here is lost when the server restarts.
// MongoDB replaces this in M4.
const now = () => new Date().toISOString();

export const recipes = [
  {
    id: randomUUID(),
    title: 'Spicy Arrabiata Penne',
    ingredients: [
      { name: 'penne rigate', measure: '1 pound' },
      { name: 'olive oil', measure: '1/4 cup' },
      { name: 'garlic', measure: '3 cloves' },
      { name: 'chopped tomatoes', measure: '1 tin' },
      { name: 'red chilli flakes', measure: '1/2 teaspoon' },
    ],
    instructions:
      'Boil the pasta. Cook garlic in olive oil, add tomatoes and chilli, simmer, then toss with the pasta.',
    category: 'Vegetarian',
    area: 'Italian',
    imageUrl: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
    sourceMealId: '52771',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: randomUUID(),
    title: 'Veggie Omelette',
    ingredients: [
      { name: 'eggs', measure: '3' },
      { name: 'bell pepper', measure: '1/2' },
      { name: 'cheddar', measure: '1/4 cup' },
    ],
    instructions: 'Whisk the eggs, pour into a hot pan, add the filling, fold and serve.',
    category: 'Breakfast',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: randomUUID(),
    title: 'Chicken Rice Bowl',
    ingredients: [
      { name: 'chicken breast', measure: '2' },
      { name: 'cooked rice', measure: '2 cups' },
      { name: 'broccoli', measure: '1 head' },
    ],
    instructions: 'Grill the chicken, steam the broccoli, and serve both over the rice.',
    category: 'Chicken',
    createdAt: now(),
    updatedAt: now(),
  },
];

export const mealPlans = [
  {
    id: randomUUID(),
    name: 'Week of Oct 19',
    weekStart: '2026-10-19',
    entries: [
      { day: 'Mon', mealType: 'dinner', recipeId: recipes[0].id, notes: 'Double the chilli' },
      { day: 'Tue', mealType: 'breakfast', recipeId: recipes[1].id },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];
