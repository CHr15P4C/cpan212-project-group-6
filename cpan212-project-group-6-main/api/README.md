# Group 6 API (Express 5 + MongoDB)

REST API for the recipes and meal planner app. Data is stored in MongoDB through Mongoose 9, so it survives a restart.

## Requirements

- Node 24 or newer (`nvm use` reads the version from `.nvmrc`)
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or MongoDB running on your own computer

## How to run

```bash
cd api
npm install
cp .env.example .env     # then set MONGODB_URI (see below)
npm run seed             # fills the database with sample data (see "Seed script")
npm run dev              # restarts when files change
# or: npm start
```

The server listens on `http://localhost:4000` (or the `PORT` you set). It connects to MongoDB first and only then starts listening. If `MONGODB_URI` is missing it stops right away with a message that says so, and if the database cannot be reached it stops with a message that says that.

### Setting MONGODB_URI

Put the connection string in `api/.env`. The `.env` file is never committed, so your password stays on your computer. `.env.example` only holds a fake value.

- **Atlas:** create a free cluster, add a database user (Database Access), allow your IP address (Network Access), then choose Connect > Drivers and copy the string. Replace `<password>` and add the database name before the `?`:
  `MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mealplanner?retryWrites=true&w=majority`
- **Local MongoDB:** `MONGODB_URI=mongodb://127.0.0.1:27017/mealplanner`

If your password has special characters (`@`, `:`, `/`, `#`), URL-encode them.

## Seed script

```bash
npm run seed
```

Run it in `api/`. It **deletes every recipe and meal plan in the database from `MONGODB_URI`**, then creates 30 recipes and 3 meal plans (the plans use some of those recipes). Run it again any time to get back to a clean starting point. It prints the database name before it deletes, and it refuses to run when `NODE_ENV=production`. No API route creates or deletes seed data.

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Required | Default | What it does |
|---|---|---|---|
| `MONGODB_URI` | **yes** | none | MongoDB connection string. The server will not start without it |
| `PORT` | no | `4000` | Port the server listens on |
| `THEMEALDB_API_KEY` | yes | none | TheMealDB key. The free public test key is `1` |
| `THEMEALDB_BASE_URL` | no | `https://www.themealdb.com/api/json/v1` | Base URL of TheMealDB (change only for testing) |
| `EXTERNAL_TIMEOUT_MS` | no | `5000` | How long to wait for TheMealDB before returning 504 |
| `CACHE_TTL_MS` | no | `300000` (5 minutes) | How long a TheMealDB search stays in the cache |

## Project structure

```
src/
  server.js          checks MONGODB_URI, connects to MongoDB, then starts the server
  seed.js            npm run seed: deletes and re-creates sample data
  app.js             middleware, routers, 404 handler, error handler
  constants.js       limits and enums shared by zod and Mongoose
  models/            Mongoose models: Recipe, MealPlan
  routes/            one express.Router() per resource
  controllers/       handler functions for each router
  validation/        zod schemas (request bodies and the list query string)
  middleware/        validateBody, notFound, errorHandler
  services/mealdb.js TheMealDB call with timeout and cache (the cache stays in memory)
  utils/             HttpError, id check, regex escape, date check
```

## Data model

- **Recipe**: `title`, `ingredients` (list of `{ name, measure }`), `instructions`, `category`, `area`, `imageUrl`, `sourceMealId`
- **MealPlan**: `name`, `weekStart`, `entries` (list of `{ day, mealType, recipeId, notes }`)
- **Relation:** each meal plan entry has a `recipeId` that is a Mongoose `ref` to a Recipe. `GET /api/mealplans` and `GET /api/mealplans/:id` use `populate`, so every entry comes back with its recipe filled in:

```json
{ "day": "Mon", "mealType": "dinner",
  "recipeId": { "id": "6b03...", "title": "Butter Chicken", "category": "Chicken", "area": "Indian" } }
```

  (`imageUrl` is included too when the recipe has one.) If a recipe is deleted, its entries are removed from every meal plan.

Documents are returned with a string `id`. Every document also has `createdAt` and `updatedAt`.

## Endpoints

| Method | Path | What it does | Success | Errors |
|---|---|---|---|---|
| GET | /api/recipes | List recipes, with filter, sort and paging (see below) | 200 | 400 |
| GET | /api/recipes/categories | The categories in use (for a filter dropdown) | 200 | none |
| GET | /api/recipes/:id | Get one recipe | 200 | 404 |
| POST | /api/recipes | Create a recipe | 201 | 400 |
| PUT | /api/recipes/:id | Replace a recipe | 200 | 400, 404 |
| DELETE | /api/recipes/:id | Delete a recipe | 204 | 404 |
| GET | /api/mealplans | List meal plans (newest week first), recipes populated | 200 | none |
| GET | /api/mealplans/:id | Get one meal plan, recipes populated | 200 | 404 |
| POST | /api/mealplans | Create a meal plan | 201 | 400 |
| PUT | /api/mealplans/:id | Replace a meal plan | 200 | 400, 404 |
| DELETE | /api/mealplans/:id | Delete a meal plan | 204 | 404 |
| GET | /api/external/meals?q=... | Search TheMealDB by name | 200 | 400, 502, 504 |
| GET | /api/external/categories | TheMealDB categories | 200 | 502, 504 |
| GET | /api/external/categories/:categoryname | TheMealDB meals in a category | 200 | 400, 502, 504 |

Unknown routes return 404. An id that is not a valid MongoDB id (for example `/api/recipes/abc`) returns 404, the same as an id that is valid but not in the database.

### Query parameters for GET /api/recipes

All are optional. Blank values (`?category=`) are ignored.

| Parameter | Default | Rules |
|---|---|---|
| `category` | none | Filter: only recipes in this category. Exact match, not case sensitive |
| `search` | none | Filter: text that appears in the title or in an ingredient name. Not case sensitive, 60 characters at most. Special characters such as `.` or `(` are matched as plain text |
| `sort` | `createdAt` | One of `title`, `category`, `createdAt`, `updatedAt`. Any other field returns 400 |
| `order` | `desc` | `asc` or `desc`. Anything else returns 400 |
| `page` | `1` | Whole number, 1 or more |
| `limit` | `10` | Whole number, 1 or more. **The maximum is 50**: a bigger number is lowered to 50 (the response shows the limit that was used) |

The response is the page of items together with the totals:

```json
{ "items": [ ... ], "total": 30, "page": 1, "limit": 10, "totalPages": 3 }
```

`totalPages` is at least 1, even when nothing matches. A `page` past the end returns an empty `items` list with the real `total`. Title and category sorting ignores upper and lower case. Example: `/api/recipes?category=chicken&search=rice&sort=title&order=asc&page=1&limit=5`

### Error shape

Every error response looks like this, and never includes a stack trace:

```json
{ "error": { "message": "Validation failed", "details": [{ "field": "title", "message": "title is required" }] } }
```

`details` is `null` when there is nothing more to say.

- **400**: the request body or query string is not valid. `details` lists each field that failed. Requests are checked twice: first with zod, then by the Mongoose schema when the data is saved. A Mongoose validation error is also a 400 with field details (for example `ingredients.0.name`), never a 500.
- **404**: the route, the id, or the document does not exist.
- **503**: the database cannot be reached.

### Request bodies

Recipe (`POST` and `PUT`): `title` (required, up to 120 characters), `ingredients` (required, 1 to 50 of `{ name, measure }`), `instructions` (required), `category`, `area`, `imageUrl` (a URL), `sourceMealId` (all optional). Unknown fields are rejected. `PUT` replaces the whole recipe, so optional fields left out are removed.

Meal plan (`POST` and `PUT`): `name` (required, up to 100 characters), `weekStart` (required, `YYYY-MM-DD`), `entries` (optional list of `{ day, mealType, recipeId, notes }`). `day` is Mon to Sun, `mealType` is breakfast, lunch, dinner or snack, `notes` is up to 200 characters, and every `recipeId` must be an existing recipe.

Updates use `{ returnDocument: 'after', runValidators: true }`, so the response is the updated document and the schema rules apply to updates too.

### External API

`GET /api/external/meals?q=pasta` calls TheMealDB from the server and returns our own shape: `{ query, count, results: [{ sourceMealId, title, category, area, instructions, imageUrl, ingredients: [{ name, measure }] }] }`.

- Waits at most `EXTERNAL_TIMEOUT_MS`, then returns 504.
- Returns 502 if TheMealDB is unreachable, answers with an error status, or sends a reply that is not JSON.
- Caches each search (the search text is not case sensitive) for `CACHE_TTL_MS`. A repeat request inside that time does not call TheMealDB, and the terminal prints `[cache] HIT ...`. A real call prints `[cache] MISS ...`. The cache is in memory and is the only data not kept in MongoDB.
- The key comes from `THEMEALDB_API_KEY` in `.env`.

### Changes from the M1 proposal

- No register or login endpoints yet, and recipes and meal plans have no `owner`. Users and sign-in come later.
- Meal plan entries use `recipeId` (the id of a recipe) instead of `recipe`.
- Deleting a recipe also removes it from any meal plan entries that used it.
- The paths for recipes, meal plans and the external search are the same as in M1.

### Changes in M4

- Recipes and meal plans are stored in MongoDB (Mongoose models) instead of in-memory arrays. Ids are now MongoDB ids and stay the same after a restart.
- `GET /api/recipes` returns `{ items, total, page, limit, totalPages }` instead of a plain array, and accepts the query parameters above.
- Meal plans return their recipes populated (`entries[].recipeId` is an object).

## Testing

Run the server first (`npm run dev`) and seed the database (`npm run seed`). On Windows, run these in Git Bash. Each command prints the response body, then the status code on its own line.

```bash
BASE=http://localhost:4000
```

### Recipes

```bash
# 1. List recipes (page 1 of the seeded 30) -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/recipes

# 2. Page 2, 5 per page -> 200
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?page=2&limit=5"

# 3. Filter by category, sort by title A-Z -> 200
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?category=Chicken&sort=title&order=asc"

# 4. Search the title or ingredients -> 200
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?search=garlic"

# 5. A sort field that is not allowed -> 400
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?sort=password"

# 6. A limit above the maximum is lowered to 50 (see "limit" in the body) -> 200
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?limit=9999"

# Save the id of one recipe for the next commands
RECIPE_ID=$(curl -s "$BASE/api/recipes?limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 7. Get one recipe -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/recipes/$RECIPE_ID

# 8. Create a recipe -> 201 (and save its id from the reply)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Tomato Soup","ingredients":[{"name":"tomatoes","measure":"6"}],"instructions":"Simmer and blend.","category":"Soup"}'
NEW_RECIPE_ID=$(curl -s -X POST $BASE/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Soup","ingredients":[{"name":"water","measure":"1 cup"}],"instructions":"Heat."}' \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 9. Update it -> 200 (the reply is the updated recipe)
curl -s -w "\n%{http_code}\n" -X PUT $BASE/api/recipes/$NEW_RECIPE_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Creamy Tomato Soup","ingredients":[{"name":"tomatoes","measure":"6"},{"name":"cream","measure":"1/2 cup"}],"instructions":"Simmer, blend, stir in cream."}'

# 10. Validation failure -> 400 (details list title, ingredients and instructions)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":""}'

# 11. A valid id that does not exist -> 404
curl -s -w "\n%{http_code}\n" $BASE/api/recipes/000000000000000000000000

# 12. A badly formed id -> 404
curl -s -w "\n%{http_code}\n" $BASE/api/recipes/does-not-exist

# 13. Delete it -> 204 (no body)
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/recipes/$NEW_RECIPE_ID

# 14. Delete it again -> 404
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/recipes/$NEW_RECIPE_ID
```

### Meal plans

```bash
# 1. List meal plans (each entry has its recipe filled in) -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans

# Save the id of the first meal plan
PLAN_ID=$(curl -s $BASE/api/mealplans | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 2. Get one meal plan -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/$PLAN_ID

# 3. Create a meal plan (uses RECIPE_ID from above) -> 201 (and save its id from the reply)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Next week\",\"weekStart\":\"2026-11-30\",\"entries\":[{\"day\":\"Wed\",\"mealType\":\"lunch\",\"recipeId\":\"$RECIPE_ID\"}]}"
NEW_PLAN_ID=$(curl -s -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Temp plan\",\"weekStart\":\"2026-12-07\",\"entries\":[{\"day\":\"Thu\",\"mealType\":\"dinner\",\"recipeId\":\"$RECIPE_ID\"}]}" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 4. Update it -> 200
curl -s -w "\n%{http_code}\n" -X PUT $BASE/api/mealplans/$NEW_PLAN_ID \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Temp plan (updated)\",\"weekStart\":\"2026-12-07\",\"entries\":[{\"day\":\"Fri\",\"mealType\":\"dinner\",\"recipeId\":\"$RECIPE_ID\",\"notes\":\"Add salad\"}]}"

# 5. Validation failure -> 400 (bad date, bad day, bad meal type)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d '{"name":"","weekStart":"2026-02-31","entries":[{"day":"Funday","mealType":"brunch","recipeId":"nope"}]}'

# 6. A recipe that does not exist -> 400
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d '{"name":"x","weekStart":"2026-11-30","entries":[{"day":"Mon","mealType":"lunch","recipeId":"000000000000000000000000"}]}'

# 7. Id that does not exist, and a badly formed id -> 404, 404
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/000000000000000000000000
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/does-not-exist

# 8. Deleting a recipe removes it from meal plans: make a recipe, use it in a plan, delete the recipe
TMP_RECIPE=$(curl -s -X POST $BASE/api/recipes -H "Content-Type: application/json" \
  -d '{"title":"Temp","ingredients":[{"name":"x"}],"instructions":"x"}' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
curl -s -X PUT $BASE/api/mealplans/$NEW_PLAN_ID -H "Content-Type: application/json" \
  -d "{\"name\":\"Temp plan\",\"weekStart\":\"2026-12-07\",\"entries\":[{\"day\":\"Mon\",\"mealType\":\"snack\",\"recipeId\":\"$TMP_RECIPE\"}]}" > /dev/null
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $BASE/api/recipes/$TMP_RECIPE     # -> 204
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/$NEW_PLAN_ID                        # -> 200, "entries":[]

# 9. Delete the plan -> 204 (no body)
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/mealplans/$NEW_PLAN_ID

# 10. Delete it again -> 404
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/mealplans/$NEW_PLAN_ID
```

### External API (TheMealDB)

```bash
# 1. Search -> 200 (terminal shows: [cache] MISS ...)
curl -s -w "\n%{http_code}\n" "$BASE/api/external/meals?q=Arrabiata"

# 2. Same search again -> 200 (terminal shows: [cache] HIT ..., no new call to TheMealDB)
curl -s -w "\n%{http_code}\n" "$BASE/api/external/meals?q=Arrabiata"

# 3. Missing search text -> 400
curl -s -w "\n%{http_code}\n" "$BASE/api/external/meals"
```

To see the 504 and 502 errors, stop the server and start it with different settings, then run the search from step 1 again:

```bash
# 504 (timeout): wait only 1 ms for TheMealDB
EXTERNAL_TIMEOUT_MS=1 npm run dev

# 502 (external API error): point at an address nothing is listening on
THEMEALDB_BASE_URL=http://localhost:9 npm run dev
```

### Unknown route

```bash
# -> 404 in the error shape
curl -s -w "\n%{http_code}\n" $BASE/api/nothing-here
```
