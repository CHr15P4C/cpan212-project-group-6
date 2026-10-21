import app from './app.js';

const PORT = process.env.PORT || 4000;

if (!process.env.THEMEALDB_API_KEY) {
  console.warn('Warning: THEMEALDB_API_KEY is not set. Copy .env.example to .env.');
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
