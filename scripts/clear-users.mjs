import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI?.trim();
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB Atlas...');
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected!\n');

const db = mongoose.connection.db;

// Clear users
const usersResult = await db.collection('users').deleteMany({});
console.log(`🗑️  Deleted ${usersResult.deletedCount} user(s)`);

// Clear messages
const messagesResult = await db.collection('messages').deleteMany({});
console.log(`🗑️  Deleted ${messagesResult.deletedCount} message(s)`);

// Clear scans
const scansResult = await db.collection('scans').deleteMany({});
console.log(`🗑️  Deleted ${scansResult.deletedCount} scan(s)`);

console.log('\n✅ All accounts and data cleared. You can now register fresh accounts!');
await mongoose.disconnect();
process.exit(0);
