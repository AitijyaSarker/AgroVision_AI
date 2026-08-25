
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { Language } from '../types';
import { getChatResponse } from '../geminiService';
import { translations } from '../translations';

interface ChatBotProps {
  lang: Language;
}

export const ChatBot: React.FC<ChatBotProps> = ({ lang }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: lang === 'bn' ? 'হ্যালো! আমি এগ্রো ভিশন এআই। আমি আপনাকে কিভাবে সাহায্য করতে পারি?' : 'Hello! I am Agro Vision AI. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
      const response = await getChatResponse(history, userMsg, lang);
      setMessages(prev => [...prev, { role: 'bot', content: response || (lang === 'bn' ? 'দুঃখিত, আমি উত্তর দিতে পারছি না।' : 'Sorry, I cannot answer that right now.') }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: lang === 'bn' ? 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' : 'Server error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-green-600 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{lang === 'bn' ? 'কৃষক বন্ধু AI' : 'Krishok Bondhu AI'}</h3>
            <p className="text-xs opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              {lang === 'bn' ? 'অনলাইন - সহায়তা করতে প্রস্তুত' : 'Online - Ready to help'}
            </p>
          </div>
        </div>
        <Info className="w-5 h-5 opacity-50 cursor-help" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50 dark:bg-zinc-950/40">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-green-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-700'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              <span className="text-sm italic text-zinc-400">{lang === 'bn' ? 'টাইপ করছে...' : 'AI is thinking...'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 ring-green-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={translations.chat_placeholder[lang]}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
