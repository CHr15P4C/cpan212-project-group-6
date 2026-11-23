// Run with: npm run seed
//
// Deletes EVERYTHING in the recipes and meal plans collections, then creates
// sample data again. This is a command-line tool only: no API route creates or
// deletes seed data.
import mongoose from 'mongoose';
import { Recipe } from './models/Recipe.js';
import { MealPlan } from './models/MealPlan.js';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV is "production".');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

// [title, category, area, ingredients ("name | measure"), instructions]
const RECIPES = [
  ['Spicy Arrabiata Penne', 'Vegetarian', 'Italian', ['penne rigate | 1 pound', 'olive oil | 1/4 cup', 'garlic | 3 cloves', 'chopped tomatoes | 1 tin', 'red chilli flakes | 1/2 teaspoon'],
    'Boil the pasta. Cook garlic in olive oil, add tomatoes and chilli, simmer, then toss with the pasta.'],
  ['Veggie Omelette', 'Breakfast', null, ['eggs | 3', 'bell pepper | 1/2', 'cheddar | 1/4 cup'],
    'Whisk the eggs, pour into a hot pan, add the filling, fold and serve.'],
  ['Chicken Rice Bowl', 'Chicken', null, ['chicken breast | 2', 'cooked rice | 2 cups', 'broccoli | 1 head'],
    'Grill the chicken, steam the broccoli, and serve both over the rice.'],
  ['Butter Chicken', 'Chicken', 'Indian', ['chicken thighs | 1 kg', 'butter | 3 tbsp', 'tomato puree | 1 cup', 'cream | 1/2 cup', 'garam masala | 2 tsp'],
    'Brown the chicken, simmer in butter and tomato puree with the spices, then stir in the cream.'],
  ['Chicken Fajitas', 'Chicken', 'Mexican', ['chicken strips | 500 g', 'bell peppers | 2', 'onion | 1', 'fajita spice | 2 tbsp', 'tortillas | 8'],
    'Sear the chicken with the spice, add sliced peppers and onion, and serve in warm tortillas.'],
  ['Lemon Herb Roast Chicken', 'Chicken', 'French', ['whole chicken | 1.8 kg', 'lemons | 2', 'thyme | 6 sprigs', 'butter | 50 g', 'garlic | 1 head'],
    'Rub the chicken with butter and herbs, stuff with lemon and garlic, and roast at 200C for about 75 minutes.'],
  ['Teriyaki Chicken', 'Chicken', 'Japanese', ['chicken thighs | 600 g', 'soy sauce | 1/4 cup', 'mirin | 1/4 cup', 'sugar | 1 tbsp', 'ginger | 1 tsp'],
    'Pan-fry the chicken, add the sauce ingredients and reduce until glossy.'],
  ['Beef Tacos', 'Beef', 'Mexican', ['ground beef | 500 g', 'taco seasoning | 2 tbsp', 'lettuce | 1 cup', 'cheddar | 1 cup', 'taco shells | 8'],
    'Brown the beef with the seasoning and a splash of water, then fill the shells and top.'],
  ['Classic Beef Burger', 'Beef', 'American', ['ground beef | 600 g', 'burger buns | 4', 'cheddar slices | 4', 'tomato | 1', 'pickles | 8 slices'],
    'Shape and grill the patties, melt the cheese on top, and build the burgers.'],
  ['Beef and Broccoli', 'Beef', 'Chinese', ['flank steak | 450 g', 'broccoli | 2 cups', 'soy sauce | 3 tbsp', 'brown sugar | 1 tbsp', 'cornstarch | 1 tsp'],
    'Slice and sear the steak, add broccoli and the sauce, and stir-fry until glossy.'],
  ['Spaghetti Bolognese', 'Pasta', 'Italian', ['spaghetti | 400 g', 'ground beef | 500 g', 'crushed tomatoes | 1 can', 'onion | 1', 'garlic | 2 cloves'],
    'Cook the beef with onion and garlic, add tomatoes and simmer 30 minutes, then serve over spaghetti.'],
  ['Fettuccine Alfredo', 'Pasta', 'Italian', ['fettuccine | 350 g', 'butter | 4 tbsp', 'heavy cream | 1 cup', 'parmesan | 1 cup'],
    'Cook the pasta. Melt butter into the cream, stir in parmesan, and toss with the pasta.'],
  ['Mac and Cheese', 'Pasta', 'American', ['macaroni | 300 g', 'milk | 2 cups', 'cheddar | 2 cups', 'butter | 2 tbsp', 'flour | 2 tbsp'],
    'Make a roux, whisk in the milk, melt in the cheese, and fold through the cooked macaroni.'],
  ['Pesto Gnocchi', 'Pasta', 'Italian', ['gnocchi | 500 g', 'basil pesto | 1/2 cup', 'cherry tomatoes | 1 cup', 'pine nuts | 2 tbsp'],
    'Boil the gnocchi until they float, then toss with pesto and halved tomatoes.'],
  ['Pad Thai', 'Noodles', 'Thai', ['rice noodles | 200 g', 'shrimp | 200 g', 'eggs | 2', 'bean sprouts | 1 cup', 'tamarind paste | 2 tbsp'],
    'Soak the noodles, stir-fry the shrimp and egg, add noodles and sauce, and finish with sprouts.'],
  ['Garlic Butter Shrimp', 'Seafood', 'American', ['shrimp | 500 g', 'butter | 3 tbsp', 'garlic | 4 cloves', 'lemon | 1', 'parsley | 2 tbsp'],
    'Sizzle the garlic in butter, add the shrimp for 3 minutes, and finish with lemon and parsley.'],
  ['Baked Salmon', 'Seafood', 'Canadian', ['salmon fillets | 4', 'maple syrup | 2 tbsp', 'dijon mustard | 1 tbsp', 'lemon | 1'],
    'Brush the fillets with the maple-mustard glaze and bake at 200C for 12 minutes.'],
  ['Fish and Chips', 'Seafood', 'British', ['cod fillets | 4', 'potatoes | 800 g', 'flour | 1 cup', 'sparkling water | 1 cup'],
    'Batter and fry the cod, fry the potato wedges until golden, and serve with malt vinegar.'],
  ['Tomato Soup', 'Soup', null, ['tomatoes | 6', 'onion | 1', 'vegetable stock | 2 cups', 'cream | 1/2 cup'],
    'Simmer the tomatoes and onion in stock, blend smooth, and stir in the cream.'],
  ['French Onion Soup', 'Soup', 'French', ['onions | 6', 'beef stock | 1 litre', 'butter | 3 tbsp', 'baguette | 4 slices', 'gruyere | 1 cup'],
    'Caramelise the onions slowly, add stock and simmer, then top with bread and cheese and grill.'],
  ['Lentil Soup', 'Soup', 'Middle Eastern', ['red lentils | 1 cup', 'carrots | 2', 'onion | 1', 'cumin | 1 tsp', 'vegetable stock | 4 cups'],
    'Soften the vegetables, add lentils, cumin and stock, simmer 25 minutes, then blend.'],
  ['Chickpea Curry', 'Vegan', 'Indian', ['chickpeas | 2 cans', 'coconut milk | 1 can', 'onion | 1', 'curry powder | 2 tbsp', 'spinach | 2 cups'],
    'Fry the onion with the curry powder, add chickpeas and coconut milk, simmer, and wilt in the spinach.'],
  ['Vegetable Stir Fry', 'Vegan', 'Chinese', ['mixed vegetables | 4 cups', 'soy sauce | 3 tbsp', 'ginger | 1 tbsp', 'garlic | 2 cloves', 'sesame oil | 1 tsp'],
    'Stir-fry the ginger and garlic, add the vegetables on high heat, and finish with soy and sesame oil.'],
  ['Greek Salad', 'Side', 'Greek', ['cucumber | 1', 'tomatoes | 3', 'feta | 150 g', 'kalamata olives | 1/2 cup', 'olive oil | 3 tbsp'],
    'Chop the vegetables, top with feta and olives, and dress with olive oil and oregano.'],
  ['Roasted Potatoes', 'Side', null, ['baby potatoes | 800 g', 'olive oil | 3 tbsp', 'rosemary | 2 sprigs', 'sea salt | 1 tsp'],
    'Toss the potatoes with oil, salt and rosemary and roast at 220C for 35 minutes.'],
  ['Pancakes', 'Breakfast', 'American', ['flour | 1 1/2 cups', 'milk | 1 1/4 cups', 'egg | 1', 'baking powder | 3 tsp', 'butter | 3 tbsp'],
    'Whisk the batter, cook ladlefuls on a buttered pan until bubbles form, flip, and serve with syrup.'],
  ['Avocado Toast', 'Breakfast', null, ['sourdough | 2 slices', 'avocado | 1', 'lemon juice | 1 tsp', 'chilli flakes | 1 pinch'],
    'Toast the bread, mash the avocado with lemon juice, spread, and sprinkle with chilli flakes.'],
  ['Overnight Oats', 'Breakfast', null, ['rolled oats | 1/2 cup', 'milk | 1/2 cup', 'yogurt | 1/4 cup', 'berries | 1/2 cup'],
    'Stir everything except the berries together, chill overnight, and top with berries.'],
  ['Chocolate Chip Cookies', 'Dessert', 'American', ['flour | 2 1/4 cups', 'butter | 1 cup', 'brown sugar | 3/4 cup', 'chocolate chips | 2 cups', 'eggs | 2'],
    'Cream the butter and sugar, beat in the eggs, mix in flour and chips, and bake at 190C for 10 minutes.'],
  ['Butter Tart', 'Dessert', 'Canadian', ['pastry shells | 12', 'butter | 1/2 cup', 'brown sugar | 1 cup', 'eggs | 2', 'raisins | 1/2 cup'],
    'Mix the filling, spoon into the shells, and bake at 190C for 15 to 20 minutes until set.'],
];

// [name, weekStart, [[day, mealType, recipe title, notes?], ...]]
const MEAL_PLANS = [
  ['Week of Oct 19', '2026-10-19', [
    ['Mon', 'dinner', 'Spicy Arrabiata Penne', 'Double the chilli'],
    ['Tue', 'breakfast', 'Veggie Omelette'],
  ]],
  ['Week of Oct 26', '2026-10-26', [
    ['Mon', 'dinner', 'Butter Chicken'],
    ['Wed', 'lunch', 'Greek Salad'],
    ['Thu', 'dinner', 'Spaghetti Bolognese', 'Make extra for lunch'],
    ['Sat', 'breakfast', 'Pancakes'],
  ]],
  ['Week of Nov 2', '2026-11-02', [
    ['Tue', 'dinner', 'Baked Salmon'],
    ['Fri', 'dinner', 'Chickpea Curry', 'Serve with rice'],
    ['Sun', 'snack', 'Chocolate Chip Cookies'],
  ]],
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Seeding database "${mongoose.connection.name}". This deletes all recipes and meal plans first.`);

  await MealPlan.deleteMany({});
  await Recipe.deleteMany({});
  await Promise.all([Recipe.init(), MealPlan.init()]); // make sure the indexes exist

  const recipes = await Recipe.insertMany(
    RECIPES.map(([title, category, area, ingredients, instructions]) => ({
      title,
      ingredients: ingredients.map((line) => {
        const [name, measure] = line.split('|').map((part) => part.trim());
        return { name, measure };
      }),
      instructions,
      ...(category && { category }),
      ...(area && { area }),
    })),
    { ordered: true },
  );
  const idByTitle = new Map(recipes.map((recipe) => [recipe.title, recipe._id]));

  const plans = await MealPlan.insertMany(
    MEAL_PLANS.map(([name, weekStart, entries]) => ({
      name,
      weekStart,
      entries: entries.map(([day, mealType, title, notes]) => ({
        day,
        mealType,
        recipeId: idByTitle.get(title),
        ...(notes && { notes }),
      })),
    })),
  );

  console.log(`Created ${recipes.length} recipes and ${plans.length} meal plans.`);
  await mongoose.disconnect();
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
