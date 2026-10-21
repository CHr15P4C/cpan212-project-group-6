# Group 6 API (Express 5)

REST API for the recipes and meal planner app. Data is kept in memory for now, so it resets whenever the server restarts. MongoDB replaces this in M4.

## Requirements

- Node 24 or newer (`nvm use` reads the version from `.nvmrc`)

## How to run

```bash
cd api
npm install
cp .env.example .env     # then check the values inside
npm run dev              # restarts when files change
# or: npm start
```

The server listens on `http://localhost:4000` (or the `PORT` you set). Each time it starts it loads a few sample recipes and one sample meal plan. Their ids are new on every start, so get a fresh id from the list endpoint.

## Environment variables

Copy `.env.example` to `.env`. The `.env` file is never committed.

| Variable | Required | Default | What it does |
|---|---|---|---|
| `PORT` | no | `4000` | Port the server listens on |
| `THEMEALDB_API_KEY` | yes | none | TheMealDB key. The free public test key is `1` |
| `THEMEALDB_BASE_URL` | no | `https://www.themealdb.com/api/json/v1` | Base URL of TheMealDB (change only for testing) |
| `EXTERNAL_TIMEOUT_MS` | no | `5000` | How long to wait for TheMealDB before returning 504 |
| `CACHE_TTL_MS` | no | `300000` (5 minutes) | How long a TheMealDB search stays in the cache |

## Project structure

```
src/
  server.js          starts the server (PORT)
  app.js             middleware, routers, 404 handler, error handler
  routes/            one express.Router() per resource
  controllers/       handler functions for each router
  validation/        zod schemas
  middleware/        validateBody, notFound, errorHandler
  services/mealdb.js TheMealDB call with timeout and cache
  data/store.js      in-memory arrays and sample items
```

## Endpoints

| Method | Path | What it does | Success | Errors |
|---|---|---|---|---|
| GET | /api/recipes | List recipes (optional `?category=`) | 200 | none |
| GET | /api/recipes/:id | Get one recipe | 200 | 404 |
| POST | /api/recipes | Create a recipe | 201 | 400 |
| PUT | /api/recipes/:id | Replace a recipe | 200 | 400, 404 |
| DELETE | /api/recipes/:id | Delete a recipe | 204 | 404 |
| GET | /api/mealplans | List meal plans | 200 | none |
| GET | /api/mealplans/:id | Get one meal plan | 200 | 404 |
| POST | /api/mealplans | Create a meal plan | 201 | 400 |
| PUT | /api/mealplans/:id | Replace a meal plan | 200 | 400, 404 |
| DELETE | /api/mealplans/:id | Delete a meal plan | 204 | 404 |
| GET | /api/external/meals?q=... | Search TheMealDB by name | 200 | 400, 502, 504 |

Unknown routes return 404.

### Error shape

Every error response looks like this, and never includes a stack trace:

```json
{ "error": { "message": "Validation failed", "details": [{ "field": "title", "message": "title is required" }] } }
```

`details` is `null` when there is nothing more to say.

### Request bodies

Recipe (`POST` and `PUT`): `title` (required), `ingredients` (required, at least one `{ name, measure }`), `instructions` (required), `category`, `area`, `imageUrl` (a URL), `sourceMealId` (all optional). Unknown fields are rejected.

Meal plan (`POST` and `PUT`): `name` (required), `weekStart` (required, `YYYY-MM-DD`), `entries` (optional list of `{ day, mealType, recipeId, notes }`). `day` is Mon to Sun, `mealType` is breakfast, lunch, dinner or snack, and every `recipeId` must be an existing recipe.

### External API

`GET /api/external/meals?q=pasta` calls TheMealDB from the server and returns our own shape: `{ query, count, results: [{ sourceMealId, title, category, area, instructions, imageUrl, ingredients: [{ name, measure }] }] }`.

- Waits at most `EXTERNAL_TIMEOUT_MS`, then returns 504.
- Returns 502 if TheMealDB is unreachable, answers with an error status, or sends a reply that is not JSON.
- Caches each search (the search text is not case sensitive) for `CACHE_TTL_MS`. A repeat request inside that time does not call TheMealDB, and the terminal prints `[cache] HIT ...`. A real call prints `[cache] MISS ...`.
- The key comes from `THEMEALDB_API_KEY` in `.env`.

### Changes from the M1 proposal

- No register or login endpoints yet, and recipes and meal plans have no `owner`. Users and sign-in come later.
- Meal plan entries use `recipeId` (the id of a recipe) instead of `recipe`.
- Deleting a recipe also removes it from any meal plan entries that used it.
- The paths for recipes, meal plans and the external search are the same as in M1.

## Testing

Run the server first (`npm run dev`). On Windows, run these in Git Bash. Each command prints the response body, then the status code on its own line.

```bash
BASE=http://localhost:4000
```

### Recipes

```bash
# 1. List recipes -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/recipes

# 2. List recipes in one category -> 200
curl -s -w "\n%{http_code}\n" "$BASE/api/recipes?category=Chicken"

# Save the id of the first recipe for the next commands
RECIPE_ID=$(curl -s $BASE/api/recipes | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 3. Get one recipe -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/recipes/$RECIPE_ID

# 4. Create a recipe -> 201
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Tomato Soup","ingredients":[{"name":"tomatoes","measure":"6"}],"instructions":"Simmer and blend.","category":"Soup"}'

# Save the id of the newest recipe
NEW_RECIPE_ID=$(curl -s $BASE/api/recipes | grep -o '"id":"[^"]*"' | tail -1 | cut -d'"' -f4)

# 5. Update it -> 200
curl -s -w "\n%{http_code}\n" -X PUT $BASE/api/recipes/$NEW_RECIPE_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Creamy Tomato Soup","ingredients":[{"name":"tomatoes","measure":"6"},{"name":"cream","measure":"1/2 cup"}],"instructions":"Simmer, blend, stir in cream."}'

# 6. Validation failure -> 400 (details list title, ingredients and instructions)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":""}'

# 7. Id that does not exist -> 404
curl -s -w "\n%{http_code}\n" $BASE/api/recipes/does-not-exist

# 8. Delete it -> 204 (no body)
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/recipes/$NEW_RECIPE_ID

# 9. Delete it again -> 404
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/recipes/$NEW_RECIPE_ID
```

### Meal plans

```bash
# 1. List meal plans -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans

# Save the id of the first meal plan
PLAN_ID=$(curl -s $BASE/api/mealplans | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 2. Get one meal plan -> 200
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/$PLAN_ID

# 3. Create a meal plan (uses RECIPE_ID from above) -> 201
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Next week\",\"weekStart\":\"2026-10-26\",\"entries\":[{\"day\":\"Wed\",\"mealType\":\"lunch\",\"recipeId\":\"$RECIPE_ID\"}]}"

# Save the id of the newest meal plan
NEW_PLAN_ID=$(curl -s $BASE/api/mealplans | grep -o '"id":"[^"]*"' | tail -1 | cut -d'"' -f4)

# 4. Update it -> 200
curl -s -w "\n%{http_code}\n" -X PUT $BASE/api/mealplans/$NEW_PLAN_ID \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Next week (updated)\",\"weekStart\":\"2026-10-26\",\"entries\":[{\"day\":\"Thu\",\"mealType\":\"dinner\",\"recipeId\":\"$RECIPE_ID\",\"notes\":\"Add salad\"}]}"

# 5. Validation failure -> 400 (bad date, bad day, bad meal type, unknown recipe)
curl -s -w "\n%{http_code}\n" -X POST $BASE/api/mealplans \
  -H "Content-Type: application/json" \
  -d '{"name":"","weekStart":"2026-02-31","entries":[{"day":"Funday","mealType":"brunch","recipeId":"nope"}]}'

# 6. Id that does not exist -> 404
curl -s -w "\n%{http_code}\n" $BASE/api/mealplans/does-not-exist

# 7. Delete it -> 204 (no body)
curl -s -w "\n%{http_code}\n" -X DELETE $BASE/api/mealplans/$NEW_PLAN_ID

# 8. Delete it again -> 404
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
