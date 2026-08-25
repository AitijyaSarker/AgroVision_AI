/**
 * Deletes all specialist accounts and their messages from MongoDB.
 * Run: node scripts/delete-specialists.cjs
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local with MONGODB_URI');
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: String,
  avatar: String,
});

const messageSchema = new mongoose.Schema({
  conversationId: String,
  senderId: String,
  receiverId: String,
  text: String,
});

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Message =
    mongoose.models.Message || mongoose.model('Message', messageSchema);

  const specialists = await User.find({
    role: { $regex: /^specialist$/i },
  }).select('_id email name');

  if (!specialists.length) {
    console.log('No specialist accounts found.');
    await mongoose.disconnect();
    return;
  }

  const ids = specialists.map((u) => String(u._id));
  console.log(`Found ${ids.length} specialist(s):`);
  specialists.forEach((u) => console.log(`  - ${u.email} (${u.name})`));

  const msgResult = await Message.deleteMany({
    $or: [{ senderId: { $in: ids } }, { receiverId: { $in: ids } }],
  });
  const userResult = await User.deleteMany({ _id: { $in: ids } });

  console.log(`Deleted ${userResult.deletedCount} specialist account(s).`);
  console.log(`Deleted ${msgResult.deletedCount} related message(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
