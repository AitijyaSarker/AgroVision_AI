import mongoose from 'mongoose';
import { connectDB } from '../models';

export async function connectToDatabase(): Promise<typeof mongoose> {
  await connectDB();
  return mongoose;
}
