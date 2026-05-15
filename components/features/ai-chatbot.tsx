'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatbot() {
  const { t, language } = useI18n()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: language === 'bn' 
        ? 'হ্যালো! আমি আপনার ফসলের রোগ সম্পর্কে সাহায্য করতে পারি। আপনি কী জানতে চান?' 
        : 'Hello! I can help you with crop diseases. What would you like to know?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    const userMessage: Message = { role: 'user', content: text }
    const historyForApi = [...messages, userMessage]
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          history: historyForApi.slice(-10),
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = await response.json()

      if (!data.response) {
        throw new Error('Empty response')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])

      if (data.source === 'gemini') {
        toast.success(
          language === 'bn' ? 'AI উত্তর প্রস্তুত' : 'AI response ready',
          { id: 'chat-ai' }
        )
      } else if (data.source === 'rules') {
        toast(
          language === 'bn'
            ? 'সীমিত মোড — Gemini সংযোগ চেক করুন'
            : 'Limited mode — check Gemini API key',
          { icon: '⚠️' }
        )
      }
    } catch {
      const fallback =
        language === 'bn'
          ? 'সংযোগ সমস্যা হয়েছে। আবার চেষ্টা করুন বা কৃষি অফিসে যোগাযোগ করুন।'
          : 'Connection issue. Please try again or contact your nearest agri office.'
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }])
      toast.error(language === 'bn' ? 'চ্যাট ব্যর্থ হয়েছে' : 'Chat failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass h-[600px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Bot className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.farmer.aiChatbot')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-primary-600' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {message.role === 'user' ? (
                <User className="h-5 w-5 text-white" />
              ) : (
                <Bot className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div className={`flex-1 rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex space-x-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...'}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-6 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  )
}

