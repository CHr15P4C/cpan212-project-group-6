import express from 'express';
import { favouriteRouter } from './routes/favourites.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { cacheRouter } from './routes/cache.routes.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Routes
app.use('/api', favouriteRouter);
app.use('/api', categoriesRouter);
app.use('/api', cacheRouter);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express 5 API!' });
});

// 1. 404 Handler for unknown routes (placed after all routes)
app.use(notFoundHandler);

// 2. Global Error-Handling Middleware (must be last)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});