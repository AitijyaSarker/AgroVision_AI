/**
 * Backfill missing receiverId on legacy messages using conversationId.
 * Run: node scripts/backfill-message-receivers.cjs
 */
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

function otherFromConversation(conversationId, senderId) {
  const parts = String(conversationId || '').split('_').filter(Boolean);
  return parts.find((p) => p !== String(senderId)) || '';
}

async function main() {
  loadEnv();
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('messages');

  const missing = await col.find({ $or: [{ receiverId: null }, { receiverId: { $exists: false } }, { receiverId: '' }] }).toArray();
  console.log(`Found ${missing.length} message(s) without receiverId`);

  let updated = 0;
  for (const msg of missing) {
    const receiverId = otherFromConversation(msg.conversationId, msg.senderId);
    if (!receiverId) continue;
    await col.updateOne({ _id: msg._id }, { $set: { receiverId } });
    updated += 1;
  }

  console.log(`Backfilled receiverId on ${updated} message(s).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
