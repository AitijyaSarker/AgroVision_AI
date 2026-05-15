# 🚀 Quick Fix for Supabase Error & Dev Server

## Problem 1: Supabase Error ✅ FIXED

**Error:** `supabaseUrl is required`

**Solution:** I've updated the Supabase client to handle missing credentials gracefully. Now you need to create `.env.local` file.

### Create `.env.local` file:

1. **In the root folder** (`F:\Agro Vision`), create a file named `.env.local`

2. **Copy this content:**
   ```env
   # Supabase Configuration (Get from https://supabase.com)
   NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key

   # AI Server
   NEXT_PUBLIC_AI_SERVER_URL=http://localhost:8000
   ```

3. **For now, use placeholder values** - The app will run but Supabase features won't work
4. **Later, replace with real Supabase credentials** (see SETUP_ENV.md)

---

## Problem 2: Dev Server Not Running

### Step 1: Check if it's already running
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### Step 2: Start the dev server
```bash
cd "F:\Agro Vision"
npm run dev
```

### Step 3: If port is busy, use different port
```bash
npm run dev -- -p 3001
```
Then open: `http://localhost:3001`

### Step 4: If you see errors, try:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies (if needed)
npm install

# Start again
npm run dev
```

---

## What Should Happen

After creating `.env.local` and running `npm run dev`:

1. ✅ Terminal shows: `Ready on http://localhost:3000`
2. ✅ Browser opens automatically
3. ✅ Homepage loads without errors
4. ⚠️ Console may show Supabase warning (safe to ignore with placeholder values)

---

## Quick Test

1. Create `.env.local` with placeholder values (above)
2. Run: `npm run dev`
3. Open: `http://localhost:3000`
4. You should see the homepage! 🎉

---

## Next: Set Up Real Supabase (Optional)

See `SETUP_ENV.md` for full Supabase setup instructions.

**The app will work for viewing pages even without real Supabase credentials!**


