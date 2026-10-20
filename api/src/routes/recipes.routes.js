import { Router } from 'express';
import { 
    getRecipesController, 
    getRecipeByIdController, 
    createRecipeController, 
    updateRecipeController, 
    deleteRecipeController 
} from '../controllers/recipes.controller.js';

export const recipeRouter = Router();

recipeRouter.get('/', getRecipesController);
recipeRouter.get('/:id', getRecipeByIdController);
recipeRouter.post('/', createRecipeController);
recipeRouter.put('/:id', updateRecipeController);
recipeRouter.delete('/:id', deleteRecipeController);