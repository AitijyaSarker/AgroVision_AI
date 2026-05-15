import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are AgroVision, an expert agricultural assistant for farmers in Bangladesh.
Help with crop diseases (especially rice), treatments, prevention, fertilizers, and when to visit an agri office.
Always reply in the same language the farmer uses (English or Bengali/Bangla).
Be practical, warm, and concise (under 150 words unless they ask for detail).
Recommend consulting a local agricultural officer for severe or unclear cases.`

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
]

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
      en: 'Choose fungicides based on the diagnosed disease. Follow label dosage, wear protection, and spray in calm weather.',
      bn: 'রোগ অনুযায়ী ফাঙ্গিসাইড বেছে নিন। লেবেলের মাত্রা মেনে চলুন, সুরক্ষা ব্যবহার করুন এবং শান্ত আবহাওয়ায় স্প্রে করুন।',
    },
    {
      keys: ['rice', 'ধান', 'paddy'],
      en: 'For rice: maintain proper water level, use balanced NPK fertilizer, scout weekly for spots on leaves, and act within 48 hours when symptoms appear.',
      bn: 'ধানের জন্য: সঠিক জলস্তর রাখুন, সুষম এনপিকে সার দিন, সাপ্তাহিক পাতা পরীক্ষা করুন এবং লক্ষণ দেখা দিলে ৪৮ ঘণ্টার মধ্যে ব্যবস্থা নিন।',
    },
    {
      keys: ['office', 'অফিস', 'nearest', 'location', 'কোথায়'],
      en: 'Use the "Find Nearest Agri Office" tab in your dashboard. Allow location access for accurate distance.',
      bn: 'ড্যাশবোর্ডে "নিকটতম কৃষি অফিস" ট্যাব ব্যবহার করুন। সঠিক দূরত্বের জন্য লোকেশন অনুমতি দিন।',
    },
    {
      keys: ['hello', 'hi', 'হ্যালো', 'নমস্কার', 'help', 'সাহায্য'],
      en: 'Hello! I can help with crop diseases, treatments, and farming advice. What crop problem are you facing?',
      bn: 'নমস্কার! আমি ফসলের রোগ, চিকিৎসা ও কৃষি পরামর্শে সাহায্য করতে পারি। আপনার সমস্যা কী?',
    },
  ]

  for (const rule of rules) {
    if (rule.keys.some((k) => lower.includes(k) || message.includes(k))) {
      return language === 'bn' ? rule.bn : rule.en
    }
  }

  return language === 'bn'
    ? 'আপনার প্রশ্নের জন্য ধন্যবাদ। রোগের নাম বা লক্ষণ বললে আরও সঠিক পরামর্শ দিতে পারব। গুরুতর ক্ষেত্রে কৃষি অফিসে যোগাযোগ করুন।'
    : 'Thanks for your question. Describe the disease or symptoms for better advice. For severe cases, contact your nearest agricultural office.'
}

/** Strip current turn and leading assistant-only messages for Gemini history. */
function normalizeHistory(history: ChatMessage[], currentMessage: string): ChatMessage[] {
  let h = [...history]

  const last = h[h.length - 1]
  if (last?.role === 'user' && last.content.trim() === currentMessage.trim()) {
    h = h.slice(0, -1)
  }

  while (h.length > 0 && h[0].role !== 'user') {
    h = h.slice(1)
  }

  return h.slice(-8)
}

function formatHistoryForPrompt(history: ChatMessage[]): string {
  if (history.length === 0) return ''
  return (
    '\n\nPrevious conversation:\n' +
    history
      .map((m) => `${m.role === 'user' ? 'Farmer' : 'AgroVision'}: ${m.content}`)
      .join('\n')
  )
}

async function tryGeminiModel(
  apiKey: string,
  modelName: string,
  message: string,
  language: string,
  history: ChatMessage[]
): Promise<string | null> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  })

  const langLine =
    language === 'bn'
      ? 'Respond in Bengali (Bangla) only.'
      : 'Respond in English only.'

  const prompt = `${langLine}${formatHistoryForPrompt(history)}

Farmer: ${message}

AgroVision:`

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 768,
    },
  })

  const text = result.response.text()
  return text?.trim() || null
}

async function geminiReply(
  message: string,
  language: string,
  history: ChatMessage[]
): Promise<{ text: string | null; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return { text: null, error: 'GEMINI_API_KEY not configured' }
  }

  const prior = normalizeHistory(history, message)
  const preferred = process.env.GEMINI_MODEL?.trim()
  const models = preferred ? [preferred, ...GEMINI_MODELS.filter((m) => m !== preferred)] : GEMINI_MODELS

  let lastError = ''

  for (const modelName of models) {
    try {
      const text = await tryGeminiModel(apiKey, modelName, message, language, prior)
      if (text) {
        return { text }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      console.error(`Gemini model ${modelName} failed:`, lastError)
    }
  }

  return { text: null, error: lastError || 'All Gemini models failed' }
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
  const { text: gemini, error: geminiError } = await geminiReply(message, language, history)
  if (gemini) {
    return { response: gemini, source: 'gemini' }
  }

  if (geminiError) {
    console.warn('Gemini unavailable, using fallback:', geminiError)
  }

  const fromServer = await aiServerReply(message, language, history)
  if (fromServer) {
    return { response: fromServer, source: 'ai-server' }
  }

  return { response: ruleBasedReply(message, language), source: 'rules' }
}
