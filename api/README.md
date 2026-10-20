Express API (coming in M2)

Testing commands:

Show all stored recipes:
curl http://localhost:4000/api/recipes

get a recipe by id:
curl http://localhost:4000/api/recipes/<recipeid>

create a new recipe:
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"name": "Pancakes", "ingredients": ["flour", "milk", "eggs", "sugar"]}'

update existing:
curl -X PUT http://localhost:4000/api/recipes/<recipeid> \
  -H "Content-Type: application/json" \
  -d '{"name": "Super Burger", "ingredients": ["bun", "beef patty", "cheese", "pickle"]}'

delete:

curl -X DELETE -I http://localhost:4000/api/recipes/<YOUR_RECIPE_ID>

bad request:
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

  not found:

curl http://localhost:4000/api/recipes/non-existent-id