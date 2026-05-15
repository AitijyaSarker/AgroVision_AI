# 🚀 Quick Start Guide - View the Website

## Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (Next.js, React, Tailwind, etc.)

## Step 2: Set Up Environment (Optional for Basic Viewing)

For basic viewing, you can skip this step. But for full functionality:

1. Create a file named `.env.local` in the root folder
2. Copy the content from `env.example` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_AI_SERVER_URL=http://localhost:8000
```

**Note:** You can view the website without Supabase, but authentication and database features won't work.

## Step 3: Start the Development Server

Run this command:

```bash
npm run dev
```

You should see output like:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

## Step 4: Open in Browser

Open your web browser and go to:

**http://localhost:3000**

That's it! 🎉 You should now see the Agro Vision website.

## 🎯 What You Can Do

- ✅ Browse all pages (Home, About, Datasets, Contact)
- ✅ Toggle between Bangla and English
- ✅ Switch between Dark and Light mode
- ✅ View all animations and UI components
- ⚠️ Authentication features require Supabase setup
- ⚠️ AI features require AI server running

## 🛑 To Stop the Server

Press `Ctrl + C` in the terminal

## 📝 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```
Then open http://localhost:3001

### Dependencies not installing?
Make sure you have Node.js 18+ installed:
```bash
node --version
```

### Still having issues?
Check `SETUP.md` for detailed instructions.


