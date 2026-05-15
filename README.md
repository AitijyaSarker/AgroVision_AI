# 🌱 Agro Vision

### AI-Powered Crop Disease Detection Platform for Farmers of Bangladesh

A comprehensive, bilingual (Bangla/English) web application that helps farmers detect crop diseases using AI, connect with agricultural specialists, and access expert advice.

## 🚀 Features

- 🤖 **AI-Powered Disease Detection** - Real-time crop disease identification from images
- 💬 **Bilingual Support** - Full Bangla and English language support
- 🌙 **Dark Mode** - Beautiful dark/light theme toggle
- 👨‍🌾 **Farmer Dashboard** - Upload images, chat with AI, connect with specialists
- 🧑‍🔬 **Specialist Dashboard** - Manage farmer requests and provide expert advice
- 📍 **Location Services** - Find nearest agricultural offices
- 💬 **Real-time Chat** - Direct communication between farmers and specialists

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **ShadCN UI**

### Backend
- **Supabase** (Auth, Database, Storage, Realtime)
- **FastAPI** (AI Inference Server)
- **Node.js/Express** (Business Logic)

### AI/ML
- **TensorFlow/PyTorch** (Disease Detection)
- **OpenCV** (Image Processing)
- **LLM** (Chatbot)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agro-vision
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
agro-vision/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── about/             # About Us page
│   ├── datasets/          # Datasets page
│   ├── contact/           # Contact page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature components
├── lib/                  # Utilities and helpers
│   ├── supabase/         # Supabase client
│   └── i18n/             # Internationalization
├── ai-server/            # FastAPI AI server
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🌐 Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AI_SERVER_URL=
OPENAI_API_KEY= (optional, for chatbot)
```

## 📝 License

MIT

## 👥 Team

Built with ❤️ for farmers of Bangladesh


