import { 
    getRecipes, 
    getRecipesById, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe 
} from '../lib/recipes.js';
import { validateRecipeInput } from '../validators/validateRecipe.js';

export const getRecipesController = (req, res, next) => {
    try {
        const recipes = getRecipes();
        res.status(200).json(recipes);
    } catch (error) {
        next(error);
    }
};

export const getRecipeByIdController = (req, res, next) => {
    try {
        const recipe = getRecipesById(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                error: {
                    message: 'Recipe not found',
                    details: { id: `Recipe with id ${req.params.id} does not exist` }
                }
            });
        }
        res.status(200).json(recipe);
    } catch (error) {
        next(error);
    }
};

export const createRecipeController = (req, res, next) => {
    try {
        const { isValid, errors } = validateRecipeInput(req.body, false);
        if (!isValid) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
        }

        const newRecipe = createRecipe(req.body);
        res.status(201).json(newRecipe);
    } catch (error) {
        next(error);
    }
};

export const updateRecipeController = (req, res, next) => {
    try {
        const { isValid, errors } = validateRecipeInput(req.body, true);
        if (!isValid) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
        }

        const updatedRecipe = updateRecipe(req.params.id, req.body);
        if (!updatedRecipe) {
            return res.status(404).json({
                error: {
                    message: 'Recipe not found',
                    details: { id: `Recipe with id ${req.params.id} does not exist` }
                }
            });
        }
        res.status(200).json(updatedRecipe);
    } catch (error) {
        next(error);
    }
};

export const deleteRecipeController = (req, res, next) => {
    try {
        const deletedRecipe = deleteRecipe(req.params.id);
        if (!deletedRecipe) {
            return res.status(404).json({
                error: {
                    message: 'Recipe not found',
                    details: { id: `Recipe with id ${req.params.id} does not exist` }
                }
            });
        }
        // Requirement: 204 for delete
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};