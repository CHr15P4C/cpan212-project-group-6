import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 4000;

if (!process.env.MONGODB_URI) {
  console.error(
    'Error: MONGODB_URI is not set.\n' +
      'Copy .env.example to .env and put your MongoDB connection string in it.',
  );
  process.exit(1);
}

if (!process.env.THEMEALDB_API_KEY) {
  console.warn('Warning: THEMEALDB_API_KEY is not set. Copy .env.example to .env.');
}

// Query filters made from user input cannot smuggle in operators like $ne or $gt.
mongoose.set('sanitizeFilter', true);

// Connect first, listen second: the API never accepts requests it cannot answer.
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB (database "${mongoose.connection.name}")`);
} catch (err) {
  console.error(
    `Error: could not connect to MongoDB: ${err.message}\n` +
      'Check MONGODB_URI, that the database is running, and (on Atlas) that your IP address is allowed.',
  );
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
