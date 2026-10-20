import { Router } from 'express';
import { getCategoriesController } from '../controllers/categories.controller';

export const categoriesRouter = Router();

categoriesRouter.get('/categories/all', getCategoriesController);