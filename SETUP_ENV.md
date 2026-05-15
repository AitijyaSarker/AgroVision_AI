# 🔧 Environment Setup Guide

## The Error You're Seeing

```
Error: supabaseUrl is required.
```

This happens because the `.env.local` file is missing or doesn't have Supabase credentials.

## Quick Fix

### Option 1: Use Placeholder Values (For Testing UI)

The `.env.local` file has been created with placeholder values. The app will run but Supabase features won't work.

### Option 2: Set Up Real Supabase (Recommended)

1. **Go to [supabase.com](https://supabase.com)** and sign up/login

2. **Create a new project:**
   - Click "New Project"
   - Choose organization
   - Enter project name: "Agro Vision"
   - Set database password
   - Choose region closest to you
   - Click "Create new project"

3. **Get your credentials:**
   - Wait for project to finish setting up (2-3 minutes)
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public key** (long string)

4. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Set up database:**
   - Go to **SQL Editor** in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Paste and run

6. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## Why localhost Not Running?

### Check if server is running:
```bash
npm run dev
```

### Common Issues:

1. **Port 3000 already in use:**
   ```bash
   # Kill process on port 3000
   # Windows:
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Or use different port:
   npm run dev -- -p 3001
   ```

2. **Node modules not installed:**
   ```bash
   npm install
   ```

3. **Check for errors in terminal:**
   - Look for error messages
   - Common: Missing dependencies, port conflicts

4. **Clear cache and restart:**
   ```bash
   rm -rf .next
   npm run dev
   ```

## Testing Without Supabase

The app will work for:
- ✅ Viewing pages (Home, About, Datasets, Contact)
- ✅ Language toggle
- ✅ Dark mode
- ✅ UI animations

But these won't work:
- ❌ Sign up / Login
- ❌ Dashboard access
- ❌ Saving data
- ❌ Real-time features

## Quick Test

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **You should see:**
   - Homepage loads
   - No Supabase errors (just warnings in console)
   - All pages work

## Next Steps

1. Set up Supabase (follow Option 2 above)
2. Update `.env.local` with real credentials
3. Run database schema
4. Restart server
5. Test authentication

---

**The app is now configured to run without crashing even without Supabase!** 🚀


