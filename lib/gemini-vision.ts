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
    return `Analyze this crop image for Bangladesh agriculture. Reply ONLY with valid JSON (no markdown):
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
Rules: confidence 0-1; solution/prevention are string arrays; if healthy use diseaseName "Healthy".`
  }
  return `Analyze this crop image for Bangladesh agriculture. Reply ONLY with valid JSON (no markdown):
{"diseaseName":"","cropName":"","confidence":0.0,"description":"","solution":[],"prevention":[]}
Rules: confidence 0-1; all text in English; solution/prevention are string arrays; if healthy use diseaseName "Healthy".`
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

  const prompt = `You are a professional Bangla agricultural translator.

Translate ALL text in this crop disease report into Bengali (Bangla script only).
Keep the same JSON keys. Return ONLY valid JSON, no English, no markdown.

Rules:
- diseaseName, cropName: short Bengali names (e.g. Potato → আলু, Common Scab → সাধারণ স্ক্যাব)
- description: full Bengali paragraph
- solution: array of Bengali treatment steps (each item one short tip)
- prevention: array of Bengali prevention tips

Input JSON:
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

  // Analyze in English first (more reliable), then translate entire result for Bangla UI
  const visionLang: 'en' | 'bn' = 'en'
  const detection = await runVisionAnalysis(genAI, base64, mimeType, visionLang)
  if (!detection) return null

  if (language === 'bn') {
    return translateScanToBengali(detection)
  }

  return detection
}
