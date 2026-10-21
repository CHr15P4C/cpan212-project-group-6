import express from 'express';
import { validateBody } from '../middleware/validate.js';
import { recipeSchema } from '../validation/schemas.js';
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipes.js';

const router = express.Router();

router.get('/', listRecipes);
router.get('/:id', getRecipe);
router.post('/', validateBody(recipeSchema), createRecipe);
router.put('/:id', validateBody(recipeSchema), updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
