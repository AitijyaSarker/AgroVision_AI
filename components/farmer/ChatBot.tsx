
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { Language } from '../../types';
import { getChatResponse } from '../../geminiService';
import { translations } from '../../translations';

interface ChatBotProps {
  lang: Language;
}

export const ChatBot: React.FC<ChatBotProps> = ({ lang }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: lang === 'bn' ? 'হ্যালো! আমি এগ্রো ভিশন এআই। আমি আপনাকে কিভাবে সাহায্য করতে পারি?' : 'Hello! I am Agro Vision AI. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim().toLowerCase();
    const originalMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: originalMsg }]);
    setLoading(true);

    // Check for demo greetings and common questions
    const greetings = ['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'ওহে'];
    const isGreeting = greetings.some(greeting => userMsg.includes(greeting));

    // Demo responses for common farming questions
    const demoResponses: { [key: string]: { en: string; bn: string } } = {
      'rice': {
        en: 'Rice is Bangladesh\'s staple crop! For healthy rice cultivation, ensure proper water management, use balanced fertilizers (NPK 60:30:30), and watch for diseases like bacterial blight. Would you like specific advice?',
        bn: 'ধান বাংলাদেশের প্রধান খাদ্যশস্য! সুস্থ ধান চাষের জন্য সঠিক জল ব্যবস্থাপনা, ভারসাম্যপূর্ণ সার (NPK 60:30:30) ব্যবহার করুন এবং ব্যাকটেরিয়াল ব্লাইটের মতো রোগের জন্য সতর্ক থাকুন। বিস্তারিত পরামর্শ চান?'
      },
      'disease': {
        en: 'I can help identify crop diseases! Common ones include: Rice blast, bacterial blight, sheath blight. Please describe the symptoms or upload a photo in the scanner section.',
        bn: 'আমি ফসলের রোগ শনাক্ত করতে সাহায্য করতে পারি! সাধারণ রোগগুলির মধ্যে রয়েছে: ধান ব্লাস্ট, ব্যাকটেরিয়াল ব্লাইট, শিথ ব্লাইট। অনুগ্রহ করে লক্ষণগুলি বর্ণনা করুন বা স্ক্যানার বিভাগে ছবি আপলোড করুন।'
      },
      'fertilizer': {
        en: 'For optimal crop growth, use balanced NPK fertilizers. Rice needs more nitrogen, while vegetables need more potassium. Soil testing is recommended for best results.',
        bn: 'ফসলের সর্বোত্তম বৃদ্ধির জন্য ভারসাম্যপূর্ণ NPK সার ব্যবহার করুন। ধানের জন্য বেশি নাইট্রোজেন দরকার, যখন সবজির জন্য বেশি পটাশিয়াম। সর্বোত্তম ফলাফলের জন্য মাটি পরীক্ষা সুপারিশ করা হয়।'
      },
      'water': {
        en: 'Proper irrigation is crucial! Rice needs 5-10 cm standing water, while other crops need soil moisture monitoring. Avoid overwatering to prevent root rot.',
        bn: 'সঠিক সেচ খুবই গুরুত্বপূর্ণ! ধানের জন্য ৫-১০ সেমি দাঁড়িয়ে থাকা জল দরকার, অন্যান্য ফসলের জন্য মাটির আর্দ্রতা পর্যবেক্ষণ করা দরকার। মূল পচা রোধ করতে অতিরিক্ত জল দেওয়া এড়িয়ে চলুন।'
      }
    };

    // Check if user message contains any demo keywords
    const demoKeyword = Object.keys(demoResponses).find(keyword => userMsg.includes(keyword));

    if (isGreeting) {
      // Demo response for greetings
      setTimeout(() => {
        const demoResponse = lang === 'bn'
          ? 'হ্যালো! আমি এগ্রো ভিশন এআই, আপনার কৃষি সহায়ক। আমি আপনাকে ফসলের রোগ, সার, এবং কৃষি পরামর্শ দিতে পারি। আপনার কোন প্রশ্ন আছে?'
          : 'Hello! I am Agro Vision AI, your agriculture assistant. I can help you with crop diseases, fertilizers, and farming advice. Do you have any questions?';
        setMessages(prev => [...prev, { role: 'bot', content: demoResponse }]);
        setLoading(false);
        setApiKeyError(false);
      }, 1000);
      return;
    } else if (demoKeyword) {
      // Demo response for common farming questions
      setTimeout(() => {
        const response = demoResponses[demoKeyword][lang];
        setMessages(prev => [...prev, { role: 'bot', content: response }]);
        setLoading(false);
        setApiKeyError(false);
      }, 1500);
      return;
    }

    try {
      const history = messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
      const response = await getChatResponse(history, originalMsg, lang);
      setMessages(prev => [...prev, { role: 'bot', content: response || (lang === 'bn' ? 'দুঃখিত, আমি উত্তর দিতে পারছি না।' : 'Sorry, I cannot answer that right now.') }]);
      setApiKeyError(false);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage = err.message || (lang === 'bn' ? 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' : 'Server error. Please try again.');
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage }]);

      // Check if it's an API key error
      if (errorMessage.includes('API কী') || errorMessage.includes('API key')) {
        setApiKeyError(true);
      }
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
            <h3 className="font-bold text-lg">{lang === 'bn' ? 'কৃষক বন্ধু এআই' : 'Krishok Bondhu AI'}</h3>
            <p className="text-xs opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              {lang === 'bn' ? 'অনলাইন - সহায়তা করতে প্রস্তুত' : 'Online - Ready to help'}
            </p>
          </div>
        </div>
        <Info className="w-5 h-5 opacity-50 cursor-help" />
      </div>

      {apiKeyError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mx-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                {lang === 'bn' ? 'API কী সেটআপ প্রয়োজন' : 'API Key Setup Required'}
              </p>
              <p className="text-amber-700 dark:text-amber-300 mb-2">
                {lang === 'bn'
                  ? 'ডেমো মোড: "হাই", "ধান", "রোগ", "সার" ইত্যাদি শব্দ দিয়ে চ্যাট করুন। API কী সেট করলে আরও ভালো উত্তর পাবেন।'
                  : 'Demo Mode: Try chatting with words like "hi", "rice", "disease", "fertilizer". Set API key for better responses.'
                }
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 underline text-xs"
              >
                {lang === 'bn' ? 'API কী পান' : 'Get API Key'}
              </a>
            </div>
          </div>
        </div>
      )}

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
