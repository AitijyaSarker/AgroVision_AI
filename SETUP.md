# 🚀 Agro Vision Setup Guide

Complete setup instructions for the Agro Vision platform.

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+ (for AI server)
- Supabase account (free tier works)

## Step 1: Clone and Install Frontend Dependencies

```bash
cd "F:\Agro Vision"
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API
3. Copy your Project URL and anon key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AI_SERVER_URL=http://localhost:8000
```

5. Run the database schema:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL

## Step 3: Set Up AI Server

```bash
cd ai-server
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

The AI server will run on `http://localhost:8000`

## Step 4: Run the Frontend

```bash
# From the root directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Configure Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Phone provider
3. Configure your phone authentication settings

## 🎨 Features to Test

1. **Homepage**: Navigate through all pages
2. **Language Toggle**: Switch between Bangla and English
3. **Dark Mode**: Toggle dark/light theme
4. **Sign Up**: Create account as Farmer or Specialist
5. **Crop Scan**: Upload an image to detect diseases
6. **AI Chatbot**: Ask questions about crop diseases
7. **Get Help**: Request assistance from specialists
8. **Find Office**: View nearby agricultural offices on map

## 🔧 Troubleshooting

### AI Server Not Responding
- Make sure the AI server is running on port 8000
- Check `NEXT_PUBLIC_AI_SERVER_URL` in `.env.local`

### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check if Row Level Security policies are set up correctly

### Map Not Loading
- Ensure Leaflet CSS is loaded (already included in globals.css)
- Check browser console for errors

## 📦 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### AI Server (Render/Railway)
1. Create new service
2. Connect GitHub repository
3. Set Python version to 3.9+
4. Install command: `pip install -r requirements.txt`
5. Start command: `python main.py`
6. Add environment variables if needed

### Database
- Supabase cloud database is already configured
- No additional setup needed

## 🎯 Next Steps

1. **Train Real AI Model**: Replace mock predictions with actual trained model
2. **Enhance Chatbot**: Integrate OpenAI or Gemini API for better responses
3. **Add More Datasets**: Expand disease detection capabilities
4. **Real-time Chat**: Implement WebSocket for live chat
5. **Notifications**: Add push notifications for specialist responses

## 📝 Notes

- The AI server currently uses mock predictions for demo purposes
- Replace with actual trained model for production
- Phone authentication requires Supabase phone provider setup
- Maps use OpenStreetMap (free, no API key needed)


