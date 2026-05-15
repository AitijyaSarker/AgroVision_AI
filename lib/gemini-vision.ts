import { GoogleGenerativeAI } from '@google/generative-ai'

export interface VisionDetection {
  cropName: string
  diseaseName: string
  confidence: number
  description: string
  solution: string[]
  prevention: string[]
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']

function parseJsonFromText(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function toStringArray(value: unknown, fallback: string): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return [value]
  }
  return [fallback]
}

export async function detectDiseaseWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  language: 'en' | 'bn'
): Promise<VisionDetection | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const base64 = imageBuffer.toString('base64')
  const prompt =
    language === 'bn'
      ? `এই ফসলের ছবি বিশ্লেষণ করুন। বাংলাদেশের কৃষির জন্য উপযুক্ত। শুধুমাত্র JSON ফরম্যাটে উত্তর দিন:
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
confidence ০ থেকে ১ এর মধ্যে। সুস্থ হলে diseaseName "সুস্থ" বা "Healthy" ব্যবহার করুন।`
      : `Analyze this crop image for Bangladesh agriculture. Reply ONLY with JSON:
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
confidence between 0 and 1. If healthy, use diseaseName "Healthy".`

  const genAI = new GoogleGenerativeAI(apiKey)

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } },
      ])
      const text = result.response.text()
      const parsed = parseJsonFromText(text)
      if (!parsed) continue

      const confidence = Number(parsed.confidence)
      if (!parsed.diseaseName || !parsed.cropName || Number.isNaN(confidence)) continue

      const fallbackSolution =
        language === 'bn'
          ? 'স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।'
          : 'Consult your local agricultural officer.'

      return {
        cropName: String(parsed.cropName),
        diseaseName: String(parsed.diseaseName),
        confidence: Math.min(1, Math.max(0, confidence)),
        description: String(parsed.description || fallbackSolution),
        solution: toStringArray(parsed.solution, fallbackSolution),
        prevention: toStringArray(
          parsed.prevention,
          language === 'bn' ? 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।' : 'Continue regular field monitoring.'
        ),
      }
    } catch (err) {
      console.error(`Gemini vision ${modelName} failed:`, err)
    }
  }

  return null
}
