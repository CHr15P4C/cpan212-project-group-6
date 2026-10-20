import {Router} from 'express';
import { getRecipes, getRecipesById, createRecipe, updateRecipe, deleteRecipe } from '../lib/recipes';

export const recipeRouter = Router();

recipeRouter.get('/', (req, res)=>{
    res.json(getRecipes());
});

recipeRouter.get('/:id', (req, res)=>{
    const recipe = getRecipesById(req.params.id);
    if (!recipe) return res.status(404).json({error: 'recipe not found'});
    res.json(recipe);
});

recipeRouter.post('/', (req, res=>{
    const {name} = req.body;
    if(!name) return res.status(400).json({error: 'name required'});
    const newRecipe = createRecipe(req.body);
    res.status(201).json(newRecipe);
}));

recipeRouter.put('/:id', (req, res)=>{
    const updatedRecipe = updateRecipe(req.params.id, req.body);
    if (!updatedRecipe) return res.status(404).json({error: 'recipe not found'});
    res.json(updatedRecipe);
});

recipeRouter.delete('/:id', (req, res)=>{
    const deletedRecipe = deleteRecipe(req.params.id);
    if (!deletedRecipe) return res.status(404).json({error: 'recipe not found'});
    res.json(deletedRecipe);
});