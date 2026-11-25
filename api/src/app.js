import express from 'express';
import recipes from './routes/recipes.js';
import mealplans from './routes/mealplans.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use('/api/recipes', recipes);
app.use('/api/mealplans', mealplans);

app.use(notFound);
app.use(errorHandler);

export default app;
