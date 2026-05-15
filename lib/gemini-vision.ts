import { GoogleGenerativeAI } from '@google/generative-ai'
import { localizeScanLabels, scanNeedsBengaliTranslation } from './scan-localize'

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
      ? `এই ফসলের ছবি বিশ্লেষণ করুন (বাংলাদেশের কৃষি)। গুরুত্বপূর্ণ: সমস্ত মান অবশ্যই বাংলা ভাষায় (বাংলা ইউনিকোড) লিখুন — ইংরেজি ব্যবহার করবেন না।

শুধুমাত্র এই JSON ফরম্যাটে উত্তর দিন (অন্য কোনো টেক্সট নয়):
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}

নিয়ম:
- diseaseName, cropName, description — সম্পূর্ণ বাংলায়
- solution ও prevention — বাংলায় স্ট্রিং অ্যারে (প্রতিটি পরামর্শ আলাদা আইটেম)
- confidence: ০ থেকে ১ এর মধ্যে সংখ্যা
- সুস্থ হলে diseaseName: "সুস্থ"
উদাহরণ cropName: ধান, আলু, টমেটো, গম`
      : `Analyze this crop image for Bangladesh agriculture. Reply ONLY with JSON:
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
confidence between 0 and 1. If healthy, use diseaseName "Healthy". All text in English.`

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

      let detection: VisionDetection = {
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

      if (language === 'bn') {
        detection = localizeScanLabels(detection)
        if (scanNeedsBengaliTranslation(detection)) {
          const translated = await translateScanToBengali(genAI, detection)
          if (translated) detection = translated
        }
      }

      return detection
    } catch (err) {
      console.error(`Gemini vision ${modelName} failed:`, err)
    }
  }

  return null
}

async function translateScanToBengali(
  genAI: GoogleGenerativeAI,
  detection: VisionDetection
): Promise<VisionDetection | null> {
  const payload = JSON.stringify({
    diseaseName: detection.diseaseName,
    cropName: detection.cropName,
    description: detection.description,
    solution: detection.solution,
    prevention: detection.prevention,
  })

  const prompt = `নিচের কৃষি রোগ বিশ্লেষণের সব টেক্সট বাংলায় অনুবাদ করুন। শুধুমাত্র একই JSON কাঠামোতে বাংলায় উত্তর দিন। ইংরেজি রাখবেন না। confidence পরিবর্তন করবেন না।

${payload}`

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const parsed = parseJsonFromText(result.response.text())
      if (!parsed) continue

      const fallbackSolution = 'স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।'
      return {
        cropName: String(parsed.cropName || detection.cropName),
        diseaseName: String(parsed.diseaseName || detection.diseaseName),
        confidence: detection.confidence,
        description: String(parsed.description || detection.description),
        solution: toStringArray(parsed.solution, fallbackSolution),
        prevention: toStringArray(
          parsed.prevention,
          'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।'
        ),
      }
    } catch {
      /* try next model */
    }
  }
  return null
}
