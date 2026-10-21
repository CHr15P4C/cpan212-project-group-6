import express from 'express';
import { validateBody } from '../middleware/validate.js';
import { mealPlanSchema } from '../validation/schemas.js';
import {
  listMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
} from '../controllers/mealplans.js';

const router = express.Router();

router.get('/', listMealPlans);
router.get('/:id', getMealPlan);
router.post('/', validateBody(mealPlanSchema), createMealPlan);
router.put('/:id', validateBody(mealPlanSchema), updateMealPlan);
router.delete('/:id', deleteMealPlan);

export default router;
