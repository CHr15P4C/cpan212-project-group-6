import { Router } from 'express';
import { getCategoriesController } from '../controllers/categories.controller.js';

export const categoriesRouter = Router();

categoriesRouter.get('/categories/', getCategoriesController);