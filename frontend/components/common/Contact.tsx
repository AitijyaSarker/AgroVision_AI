import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Language } from '../../types';

export const Contact: React.FC = () => {
  const { t, lang } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-16">
      <div className="space-y-8">
        <h2 className="text-5xl font-black leading-tight text-zinc-900 dark:text-white">
          {t('contact_title')}
        </h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-700 dark:text-green-500">
              <Mail />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t('contact_email')}</p>
              <p className="font-bold text-zinc-900 dark:text-white">support@agrovision.bd</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-500">
              <Phone />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t('contact_phone')}</p>
              <p className="font-bold text-zinc-900 dark:text-white">+880 1712-345678</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-700 dark:text-orange-500">
              <MapPin />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t('contact_location')}</p>
              <p className="font-bold text-zinc-900 dark:text-white">Neural Nodes HQ, Dhaka</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-10 rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
        {submitted ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-500">
            <CheckCircle className="w-16 h-16 text-green-700 dark:text-green-500 mb-4" />
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{t('message_sent')}</h3>
            <p className="text-zinc-700 dark:text-zinc-400 font-bold">{t('message_response')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-zinc-800 dark:text-zinc-300 ml-1">{t('contact_name')}</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold outline-none focus:ring-2 ring-green-600 transition-all" placeholder={t('contact_name_placeholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-zinc-800 dark:text-zinc-300 ml-1">{t('contact_message')}</label>
                <textarea required rows={4} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold outline-none focus:ring-2 ring-green-600 transition-all resize-none" placeholder={t('contact_message_placeholder')} />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl shadow-xl shadow-green-700/20 transform transition-all active:scale-95">
              {t('submit_message')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};