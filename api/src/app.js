import express from 'express';
import recipesRouter from './routes/recipes.js';
import mealPlansRouter from './routes/mealplans.js';
import externalRouter from './routes/external.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();

app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/mealplans', mealPlansRouter);
app.use('/api/external', externalRouter);

// These two must stay after all the routes.
app.use(notFound);
app.use(errorHandler);

export default app;
