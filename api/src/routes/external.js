import express from 'express';
import { searchExternalMeals } from '../controllers/external.js';

const router = express.Router();

router.get('/meals', searchExternalMeals);

export default router;
