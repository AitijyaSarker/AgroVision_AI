import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse, type ChatMessage } from '@/lib/chat-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const language = body.language === 'bn' ? 'bn' : 'en'
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history.filter(
          (m: unknown) =>
            m &&
            typeof m === 'object' &&
            'role' in m &&
            'content' in m &&
            ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant')
        )
      : []

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { response, source } = await generateChatResponse(message, language, history)

    return NextResponse.json({ response, language, source })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
