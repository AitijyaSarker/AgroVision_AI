import { GoogleGenerativeAI } from '@google/generative-ai'
import { localizeScanLabels, looksEnglish } from './scan-localize'

export interface VisionDetection {
  cropName: string
  diseaseName: string
  confidence: number
  description: string
  solution: string[]
  prevention: string[]
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']

function parseJsonFromText(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function toStringArray(value: unknown, fallback: string): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n+|(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return [fallback]
}

function buildVisionPrompt(language: 'en' | 'bn'): string {
  if (language === 'bn') {
    return `আপনি বাংলাদেশের একজন বিশেষজ্ঞ কৃষি বিজ্ঞানী। এই ফসলের ছবি বিশ্লেষণ করুন।
শুধুমাত্র নিচের JSON ফরম্যাটে উত্তর দিন (কোনো markdown বা ব্যাখ্যা নয়):
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}

গুরুত্বপূর্ণ নিয়ম:
- diseaseName, cropName, description, solution এবং prevention — সবকিছু অবশ্যই বাংলায় (বাংলা হরফে) লিখতে হবে।
- confidence: ০ থেকে ১ এর মধ্যে দশমিক সংখ্যা।
- solution এবং prevention: বাংলা ভাষায় স্ট্রিং অ্যারে।
- ফসল সুস্থ হলে diseaseName = "সুস্থ" ব্যবহার করুন।
- কোনো ইংরেজি শব্দ ব্যবহার করবেন না।`
  }
  return `You are an expert agricultural scientist for Bangladesh. Analyze this crop image.
Reply ONLY with valid JSON (no markdown, no explanation):
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
Rules: confidence 0-1 decimal; all text in English; solution/prevention are string arrays; if healthy use diseaseName "Healthy".`
}

async function runVisionAnalysis(
  genAI: GoogleGenerativeAI,
  base64: string,
  mimeType: string,
  language: 'en' | 'bn'
): Promise<VisionDetection | null> {
  const prompt = buildVisionPrompt(language)
  const fallbackSolution =
    language === 'bn'
      ? 'স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।'
      : 'Consult your local agricultural officer.'

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      })
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } },
      ])
      const parsed = parseJsonFromText(result.response.text())
      if (!parsed) continue

      const confidence = Number(parsed.confidence)
      if (!parsed.diseaseName || !parsed.cropName || Number.isNaN(confidence)) continue

      return {
        cropName: String(parsed.cropName),
        diseaseName: String(parsed.diseaseName),
        confidence: Math.min(1, Math.max(0, confidence)),
        description: String(parsed.description || fallbackSolution),
        solution: toStringArray(parsed.solution, fallbackSolution),
        prevention: toStringArray(
          parsed.prevention,
          language === 'bn'
            ? 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।'
            : 'Continue regular field monitoring.'
        ),
      }
    } catch (err) {
      console.error(`Gemini vision ${modelName} failed:`, err)
    }
  }
  return null
}

/** Always translate full scan JSON to Bengali (used when UI language is bn). */
export async function translateScanToBengali(
  detection: VisionDetection
): Promise<VisionDetection> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return localizeScanLabels(detection)

  const genAI = new GoogleGenerativeAI(apiKey)
  const payload = JSON.stringify({
    diseaseName: detection.diseaseName,
    cropName: detection.cropName,
    description: detection.description,
    solution: detection.solution,
    prevention: detection.prevention,
  })

  const prompt = `আপনি একজন পেশাদার বাংলাদেশী কৃষি অনুবাদক। নিচের ফসলের রোগ প্রতিবেদনটি সম্পূর্ণ বাংলায় অনুবাদ করুন।

শুধুমাত্র JSON আউটপুট দিন — কোনো ইংরেজি শব্দ, markdown বা ব্যাখ্যা নয়।

নিয়মাবলী:
- diseaseName: বাংলায় রোগের নাম (যেমন: Common Scab → সাধারণ স্ক্যাব, Healthy → সুস্থ)
- cropName: বাংলায় ফসলের নাম (যেমন: Potato → আলু, Rice → ধান)
- description: পূর্ণ বাংলা অনুচ্ছেদ, রোগের কারণ ও লক্ষণ সহ
- solution: প্রতিটি চিকিৎসা পদক্ষেপ আলাদা বাংলা স্ট্রিং হিসেবে অ্যারেতে
- prevention: প্রতিটি প্রতিরোধ টিপস আলাদা বাংলা স্ট্রিং হিসেবে অ্যারেতে
- কোনো ইংরেজি শব্দ ব্যবহার করা যাবে না

ইনপুট JSON:
${payload}`

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      })
      const result = await model.generateContent(prompt)
      const parsed = parseJsonFromText(result.response.text())
      if (!parsed) continue

      const fallbackSolution = 'স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।'
      const translated: VisionDetection = {
        cropName: String(parsed.cropName || detection.cropName),
        diseaseName: String(parsed.diseaseName || detection.diseaseName),
        confidence: detection.confidence,
        description: String(parsed.description || detection.description),
        solution: toStringArray(parsed.solution, fallbackSolution),
        prevention: toStringArray(parsed.prevention, 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।'),
      }

      if (!looksEnglish(translated.description) && !translated.solution.some(looksEnglish)) {
        return translated
      }
    } catch (err) {
      console.error(`Gemini translate ${modelName} failed:`, err)
    }
  }

  return localizeScanLabels(detection)
}

export async function detectDiseaseWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  language: 'en' | 'bn'
): Promise<VisionDetection | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const genAI = new GoogleGenerativeAI(apiKey)
  const base64 = imageBuffer.toString('base64')

  // For Bengali: first try direct Bengali analysis, then fall back to translate-from-English
  if (language === 'bn') {
    // Try direct Bengali analysis
    const directBn = await runVisionAnalysis(genAI, base64, mimeType, 'bn')
    if (directBn && !looksEnglish(directBn.description) && !directBn.solution.some(looksEnglish)) {
      return directBn
    }
    // Fall back: analyze in English, then translate
    const enDetection = await runVisionAnalysis(genAI, base64, mimeType, 'en')
    if (!enDetection) return directBn || null
    return translateScanToBengali(enDetection)
  }

  const detection = await runVisionAnalysis(genAI, base64, mimeType, 'en')
  return detection || null
}
