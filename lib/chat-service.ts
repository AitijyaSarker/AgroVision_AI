import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are AgroVision, an expert agricultural assistant for farmers in Bangladesh.
Help with crop diseases (especially rice), treatments, prevention, and when to visit an agri office.
Reply in the user's language (English or Bengali/Bangla).
Be practical, concise, and safe. Recommend consulting a specialist for severe or uncertain cases.`

function ruleBasedReply(message: string, language: string): string {
  const lower = message.toLowerCase()

  const rules: { keys: string[]; en: string; bn: string }[] = [
    {
      keys: ['brown spot', 'বাদামী', 'brown spot disease'],
      en: 'Brown spot is a fungal disease. Remove infected leaves, avoid excess nitrogen, improve airflow, and apply Propiconazole or Tricyclazole fungicide as directed on the label.',
      bn: 'বাদামী দাগ একটি ছত্রাকজনিত রোগ। সংক্রামিত পাতা সরান, অতিরিক্ত নাইট্রোজেন এড়িয়ে চলুন, বায়ু চলাচল বাড়ান এবং লেবেল অনুযায়ী প্রোপিকোনাজল বা ট্রাইসাইক্লাজল প্রয়োগ করুন।',
    },
    {
      keys: ['blast', 'ব্লাস্ট'],
      en: 'Blast diseases spread quickly in humid weather. Use resistant varieties, apply fungicides early, and avoid dense planting.',
      bn: 'ব্লাস্ট রোগ আর্দ্র আবহাওয়ায় দ্রুত ছড়ায়। প্রতিরোধী জাত ব্যবহার করুন, প্রাথমিক পর্যায়ে ফাঙ্গিসাইড দিন এবং ঘন চাষ এড়িয়ে চলুন।',
    },
    {
      keys: ['bacterial', 'ব্যাকটেরিয়া'],
      en: 'For bacterial blight: use clean seeds, avoid working in wet fields, and apply copper-based bactericides. Crop rotation helps reduce recurrence.',
      bn: 'ব্যাকটেরিয়াল ব্লাইটের জন্য: পরিষ্কার বীজ ব্যবহার করুন, ভেজা ক্ষেতে কাজ করবেন না, তামা-ভিত্তিক ব্যাকটেরিসাইড প্রয়োগ করুন। ফসল পরিবর্তন পুনরাবৃত্তি কমায়।',
    },
    {
      keys: ['fungicide', 'ফাঙ্গিসাইড', 'medicine', 'ওষুধ'],
      en: 'Choose fungicides based on the diagnosed disease. Follow label dosage, wear protection, and spray in calm weather. Rotate active ingredients to prevent resistance.',
      bn: 'রোগ অনুযায়ী ফাঙ্গিসাইড বেছে নিন। লেবেলের মাত্রা মেনে চলুন, সুরক্ষা ব্যবহার করুন এবং শান্ত আবহাওয়ায় স্প্রে করুন। প্রতিরোধ এড়াতে বিভিন্ন ধরনের ওষুধ ব্যবহার করুন।',
    },
    {
      keys: ['rice', 'ধান', 'paddy'],
      en: 'For rice: maintain proper water level, use balanced NPK fertilizer, scout weekly for spots on leaves, and act within 48 hours when symptoms appear.',
      bn: 'ধানের জন্য: সঠিক জলস্তর রাখুন, সুষম এনপিকে সার দিন, সাপ্তাহিক পাতা পরীক্ষা করুন এবং লক্ষণ দেখা দিলে ৪৮ ঘণ্টার মধ্যে ব্যবস্থা নিন।',
    },
    {
      keys: ['office', 'অফিস', 'nearest', 'location', 'কোথায়'],
      en: 'Use the "Find Nearest Agri Office" tab in your dashboard. Allow location access for accurate distance, or search manually on the map.',
      bn: 'ড্যাশবোর্ডে "নিকটতম কৃষি অফিস" ট্যাব ব্যবহার করুন। সঠিক দূরত্বের জন্য লোকেশন অনুমতি দিন, অথবা মানচিত্রে অফিস খুঁজুন।',
    },
    {
      keys: ['hello', 'hi', 'হ্যালো', 'নমস্কার', 'help', 'সাহায্য'],
      en: 'Hello! I can help with crop diseases, treatments, and farming advice. Describe your crop problem or upload a photo in the scanner tab.',
      bn: 'নমস্কার! আমি ফসলের রোগ, চিকিৎসা ও কৃষি পরামর্শে সাহায্য করতে পারি। সমস্যা বর্ণনা করুন অথবা স্ক্যানারে ছবি আপলোড করুন।',
    },
  ]

  for (const rule of rules) {
    if (rule.keys.some((k) => lower.includes(k) || message.includes(k))) {
      return language === 'bn' ? rule.bn : rule.en
    }
  }

  return language === 'bn'
    ? 'আপনার প্রশ্নের জন্য ধন্যবাদ। রোগের নাম, লক্ষণ বা ছবির বিবরণ দিলে আরও সঠিক পরামর্শ দিতে পারব। গুরুতর ক্ষেত্রে নিকটস্থ কৃষি অফিসে যোগাযোগ করুন।'
    : 'Thanks for your question. Share the disease name, symptoms, or upload a crop photo in the scanner for better advice. For severe cases, contact your nearest agricultural office.'
}

async function geminiReply(
  message: string,
  language: string,
  history: ChatMessage[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const chat = model.startChat({
      history: history.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    })

    const langHint =
      language === 'bn'
        ? ' (উত্তর বাংলায় দিন)'
        : ' (reply in English)'

    const result = await chat.sendMessage(message + langHint)
    const text = result.response.text()
    return text?.trim() || null
  } catch {
    return null
  }
}

async function aiServerReply(
  message: string,
  language: string,
  history: ChatMessage[]
): Promise<string | null> {
  const aiServerUrl = process.env.AI_SERVER_URL || process.env.NEXT_PUBLIC_AI_SERVER_URL
  if (!aiServerUrl) return null

  try {
    const res = await fetch(`${aiServerUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        context: 'crop_disease_detection',
        history: history.slice(-10),
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.response === 'string' ? data.response : null
  } catch {
    return null
  }
}

export async function generateChatResponse(
  message: string,
  language: string,
  history: ChatMessage[] = []
): Promise<{ response: string; source: 'gemini' | 'rules' | 'ai-server' }> {
  const gemini = await geminiReply(message, language, history)
  if (gemini) {
    return { response: gemini, source: 'gemini' }
  }

  const fromServer = await aiServerReply(message, language, history)
  if (fromServer) {
    return { response: fromServer, source: 'ai-server' }
  }

  return { response: ruleBasedReply(message, language), source: 'rules' }
}
