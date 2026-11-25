import express from 'express';
import { validateBody } from '../middleware/validate.js';
import { mealPlanSchema } from '../validation/schemas.js';

import {
  listMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan
} from '../controllers/mealplans.js';

import { MealPlan } from '../models/MealPlan.js';
import { assertObjectId } from '../utils/ids.js';
import { HttpError } from '../utils/HttpError.js';
import { groceries } from '../utils/groceries.js';

const router = express.Router();

async function load(id) {
  assertObjectId(id, 'Meal plan');

  const plan = await MealPlan.findById(id)
    .populate('entries.recipeId', 'ingredients');

  if (!plan) {
    throw new HttpError(404, 'Meal plan not found');
  }

  return plan;
}

router.get('/:id/groceries', async (req, res) => {
  const plan = await load(req.params.id);

  res.json(
    groceries(plan.entries).map(i => ({
      ...i,
      checked: plan.checkedGroceries.includes(i.key)
    }))
  );
});

router.put('/:id/groceries', async (req, res) => {
  const plan = await load(req.params.id);
  const { key, checked } = req.body || {};

  if (
    typeof checked !== 'boolean' ||
    !groceries(plan.entries).some(i => i.key === key)
  ) {
    throw new HttpError(400, 'Invalid grocery item');
  }

  const update = checked
    ? { $addToSet: { checkedGroceries: key } }
    : { $pull: { checkedGroceries: key } };

  await MealPlan.updateOne(
    { _id: plan._id },
    update
  );

  res.json({ key, checked });
});

router.get('/', listMealPlans);
router.get('/:id', getMealPlan);

router.post(
  '/',
  validateBody(mealPlanSchema),
  createMealPlan
);

router.put(
  '/:id',
  validateBody(mealPlanSchema),
  updateMealPlan
);

router.delete('/:id', deleteMealPlan);

export default router;
