import express from 'express';
import { validateBody } from '../middleware/validate.js';
import { recipeSchema } from '../validation/schemas.js';
import {
  listRecipes,
  listRecipeCategories,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipes.js';

const router = express.Router();

router.get('/', listRecipes);
// Must stay above '/:id', or "categories" would be read as a recipe id.
router.get('/categories', listRecipeCategories);
router.get('/:id', getRecipe);
router.post('/', validateBody(recipeSchema), createRecipe);
router.put('/:id', validateBody(recipeSchema), updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
