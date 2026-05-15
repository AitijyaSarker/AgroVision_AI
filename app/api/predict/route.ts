import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { analyzeImageBuffer } from '@/lib/crop-analysis'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const language = (formData.get('language') as string) || 'en'

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 })
    }

    const aiServerUrl = process.env.AI_SERVER_URL || process.env.NEXT_PUBLIC_AI_SERVER_URL

    if (aiServerUrl) {
      try {
        const proxyForm = new FormData()
        proxyForm.append('file', new Blob([buffer], { type: file.type || 'image/jpeg' }), 'crop.jpg')

        const res = await fetch(
          `${aiServerUrl}/predict?language=${encodeURIComponent(language)}`,
          { method: 'POST', body: proxyForm }
        )

        if (res.ok) {
          const data = await res.json()
          return NextResponse.json({ ...data, source: 'ai-server' })
        }
      } catch {
        // fall through to local analysis
      }
    }

    const { data, info } = await sharp(buffer)
      .rotate()
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const result = analyzeImageBuffer(data, info.width, info.height, language)
    return NextResponse.json({ ...result, source: 'local-analysis' })
  } catch (error) {
    console.error('Predict API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
