import express from 'express';
import { searchExternalMeals, getExternalCategories, getExternalMealsByCategory } from '../controllers/external.js';

const router = express.Router();

router.get('/meals', searchExternalMeals);
//route for categories from external:
router.get('/categories', getExternalCategories);
//recipes by category:
router.get('/categories/:categoryname', getExternalMealsByCategory);
export default router;
