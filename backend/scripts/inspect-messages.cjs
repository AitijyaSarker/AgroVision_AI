const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[trimmed.slice(0, eq).trim()] = val;
  }
}

async function main() {
  loadEnv();
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).project({ email: 1, role: 1, name: 1 }).toArray();
  const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).limit(20).toArray();
  console.log('--- Users ---');
  users.forEach((u) => console.log(String(u._id), u.role, u.email));
  console.log('--- Messages ---');
  messages.forEach((m) =>
    console.log({
      senderId: m.senderId,
      receiverId: m.receiverId,
      conversationId: m.conversationId,
      text: (m.text || '').slice(0, 50),
    })
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
