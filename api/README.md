Express API (coming in M2)
curl Testing:

Show all stored favs:
curl http://localhost:4000/api/favourites

get a fav by id:
curl http://localhost:4000/api/recipes/<recipeid>

create a new fav:
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"name": "Pancakes", "ingredients": ["flour", "milk", "eggs", "sugar"]}'

update fav:
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

categories:
curl http://localhost:4000/api/categories/
__________________________________________________________________
M2 demo url's:
1. list endpoint:
http://localhost:4000/api/favourites
2. 1 item by id
http://localhost:4000/api/favourites/<recipeid>
http://localhost:4000/api/favourites/87e454f0-adf0-424f-9ae3-e0c9a6500328

3. id that doesnt exist for 404 error
http://localhost:4000/api/favourites/420

4. open external api twice to show cached hit:
http://localhost:4000/api/categories/
http://localhost:4000/api/categories/

Run with:
npm run dev

Env Variables:
PORT=4000
THEMEALDBURL=https://www.themealdb.com/api/json/v1/
DEVKEY=1
UPSTREAM_TIMEOUT_MS=5000
CACHE_TTL_SECONDS=600

Endpoints:
-------------------------------------------------
|/categories/|external api categories of recipes|
-------------------------------------------------
|/favourites/|local storage of favourite recipes|
-------------------------------------------------

To dos:

parse external recipes based on categories, name, .....
add external recipe into favourites