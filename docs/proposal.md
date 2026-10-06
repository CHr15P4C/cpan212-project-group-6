#M1
1. Problem and users.
Planning meals with dietary constraints is difficult, and many apps that do it well are very expensive ie:Noom which is $70 per month. People should be able to query recipies based on general category, tates, dietary restrictions, macros, and caloric quantity. A stretch goal would be adding a budgetary element to the app but with inflation and variable food prices, and lack of available data this may not be possible.

This app will be solving two problems: 
1. Meal Planning - being able to plan meals for the week in an organized interface, maybe creating a shopping list by aggregating all ingredients. 
2. Weight loss - this app will highlight caloric intake and marcos to allow users to plan according to their dietary goals.

2. Features
-Meal Calendar (maybe weekly)
-Recipe api search with constraints (dietary restrictions, calories, macros)
-calorie tracking over time
-weight tracking over time
-Shopping list based on planned meals within defined duration

3. External API
The meal DB:
https://www.themealdb.com/api.php
Free key = 1
Request:
https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
Response:
```
{"meals":[{"idMeal":"52771","strMeal":"Spicy Arrabiata Penne","strMealAlternate":null,"strCategory":"Vegetarian","strArea":"Italian","strCountry":"Italy","strInstructions":"Bring a large pot of water to a boil. Add kosher salt to the boiling water, then add the pasta. Cook according to the package instructions, about 9 minutes.\r\nIn a large skillet over medium-high heat, add the olive oil and heat until the oil starts to shimmer. Add the garlic and cook, stirring, until fragrant, 1 to 2 minutes. Add the chopped tomatoes, red chile flakes, Italian seasoning and salt and pepper to taste. Bring to a boil and cook for 5 minutes. Remove from the heat and add the chopped basil.\r\nDrain the pasta and add it to the sauce. Garnish with Parmigiano-Reggiano flakes and more basil and serve warm.","strMealThumb":"https:\/\/www.themealdb.com\/images\/media\/meals\/ustsqw1468250014.jpg","strTags":"Pasta,Curry","strYoutube":"https:\/\/www.youtube.com\/watch?v=1IszT_guI08","strIngredient1":"penne rigate","strIngredient2":"olive oil","strIngredient3":"garlic","strIngredient4":"chopped tomatoes","strIngredient5":"red chilli flakes","strIngredient6":"italian seasoning","strIngredient7":"basil","strIngredient8":"Parmigiano-Reggiano","strIngredient9":"","strIngredient10":"","strIngredient11":"","strIngredient12":"","strIngredient13":"","strIngredient14":"","strIngredient15":"","strIngredient16":null,"strIngredient17":null,"strIngredient18":null,"strIngredient19":null,"strIngredient20":null,"strMeasure1":"1 pound","strMeasure2":"1\/4 cup","strMeasure3":"3 cloves","strMeasure4":"1 tin ","strMeasure5":"1\/2 teaspoon","strMeasure6":"1\/2 teaspoon","strMeasure7":"6 leaves","strMeasure8":"sprinkling",}]}
```
We will also be looking into 
https://platform.fatsecret.com/
Fat Secret as it does have rest api:
https://platform.fatsecret.com/rest/
but requires oAuth1.0 or OAuth2.0 with a secret client key based on a free account.
This API has many more fields and would be advantageous to have set up.

A third option:
https://api-ninjas.com/api/recipe#recipe-endpoint
Free Key with signup
3000 api calls per month, 100 per hour.
Demo request:
https://api.api-ninjas.com/v3/recipe?title=lentil%20soup
```
[
  {
    "title": "Gramma's Lentil Soup with Garlic Bread",
    "servings": "6 servings",
    "instructions": [
      "Heat the oil in a pan and fry the onions until soft (about 5 minutes).",
      "Add the garlic, leeks, carrots and celery and cook for 5 minutes, stirring occasionally.",
      "Add the paprika, herbs, pepper sauce, vinegar, lentils, tomatoes and stock. Stir well.",
      "Bring to the boil, then reduce heat and simmer for 40-50 minutes, stirring occasionally.",
      "Remove from heat, leave to cool slightly, then liquidise in a food processor or blender, or pass through a large sieve.",
      "Pour back into pan and reheat.",
      "Serve with hot toasted garlic bread."
    ],
    "nutrition": {
      "calories": 731.715113,
      "total_fat": 34.061013,
      "saturated_fat": 2.755683,
      "protein": 20.78461,
      "sodium": 3507.669017,
      "potassium": 488.858444,
      "dietary_fiber": 27.606772,
      "cholesterol": 0,
      "sugars": 38.105134,
      "total_carbohydrate": 96.210082
    },
    "ingredients": [
      {
        "name": "Oil",
        "quantity": 2,
        "unit": "tablespoon"
      },
      {
        "name": "Onion; chopped",
        "quantity": 1,
        "unit": "unit"
      },
      {
        "name": "Garlic cloves; finely grated or pureed",
        "quantity": 3,
        "unit": "clove"
      },
      {
        "name": "Leek; finely chopped",
        "quantity": 1,
        "unit": "unit"
      },
      {
        "name": "Carrots; diced",
        "quantity": 3,
        "unit": "unit"
      },
      {
        "name": "Celery stalks; finely chopped",
        "quantity": 3,
        "unit": "stalk"
      },
      {
        "name": "Paprika",
        "quantity": 1,
        "unit": "teaspoon"
      },
      {
        "name": "Died mixed herbs",
        "quantity": 1,
        "unit": "teaspoon"
      },
      {
        "name": "Gramma's Mild Pepper Sauce",
        "quantity": 1,
        "unit": "teaspoon"
      },
      {
        "name": "Wine vinegar",
        "quantity": 2,
        "unit": "teaspoon"
      },
      {
        "name": "Red lentils; rinsed",
        "quantity": 3,
        "unit": "ounce"
      },
      {
        "name": "4 oz can tomatoes",
        "quantity": 1,
        "unit": "can"
      },
      {
        "name": "Vegetable stock",
        "quantity": 2,
        "unit": "pint"
      }
    ]
  }
]
```

4. Data Model Draft
A User has one meal calendar. A Meal calendar has one user.
A User has many meals. A meal may only have one user.
A meal has one recipe. A recipe may have many meals.
A shopping list may have many ingredients, an ingredient may be in many shopping lists.
A recipe may have many ingredients, an ingredient may be in many recipes.

5. Endpoint list

6. Wireframes

7. Team roles

8. Repo Setup