import express from 'express';
import { recipeRouter } from './routes/recipes.routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api/recipes', recipeRouter);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express 5 API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});