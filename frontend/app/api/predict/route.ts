import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { analyzeImageBuffer } from '@/lib/crop-analysis'
import { detectDiseaseWithGemini } from '@/lib/gemini-vision'

export const runtime = 'nodejs'

function mapHeuristicResult(
  result: ReturnType<typeof analyzeImageBuffer>,
  language: string
) {
  const isBn = language === 'bn'
  const conf = result.confidence > 1 ? result.confidence / 100 : result.confidence
  return {
    cropName: result.crop,
    diseaseName: result.disease,
    confidence: conf,
    description: result.description || result.solution,
    solution: [result.solution],
    prevention: [
      isBn ? 'নিয়মিত পর্যবেক্ষণ চালিয়ে যান।' : 'Continue regular field monitoring.',
    ],
    source: 'local-analysis' as const,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const langRaw = String(formData.get('language') ?? '').toLowerCase()
    const language = langRaw === 'bn' || langRaw.startsWith('bn') ? 'bn' : 'en'

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 })
    }

    const mimeType = file.type || 'image/jpeg'

    const geminiResult = await detectDiseaseWithGemini(buffer, mimeType, language)
    if (geminiResult) {
      return NextResponse.json({
        cropName: geminiResult.cropName,
        diseaseName: geminiResult.diseaseName,
        confidence: Math.round(geminiResult.confidence * 1000) / 10,
        description: geminiResult.description,
        solution: geminiResult.solution,
        prevention: geminiResult.prevention,
        crop: geminiResult.cropName,
        disease: geminiResult.diseaseName,
        language,
        source: 'gemini-vision',
      })
    }

    const { data, info } = await sharp(buffer)
      .rotate()
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const heuristic = analyzeImageBuffer(data, info.width, info.height, language)
    const mapped = mapHeuristicResult(heuristic, language)

    return NextResponse.json({
      cropName: mapped.cropName,
      diseaseName: mapped.diseaseName,
      confidence: Math.round(mapped.confidence * 1000) / 10,
      description: mapped.description,
      solution: mapped.solution,
      prevention: mapped.prevention,
      crop: mapped.cropName,
      disease: mapped.diseaseName,
      language,
      source: mapped.source,
    })
  } catch (error) {
    console.error('Predict API error:', error)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
