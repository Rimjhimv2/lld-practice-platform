import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 8080);
if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('The API will continue with in-memory attempt history for this run.');
  }
}
const app = createApp();
app.listen(port, () => console.log(`LLD Practice API listening on http://localhost:${port}`));
