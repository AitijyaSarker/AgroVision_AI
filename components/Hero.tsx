
import React from 'react';
import { Scan, ShieldCheck, Microscope, Users } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeroProps {
  lang: Language;
  onScanClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onScanClick }) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <div className="relative overflow-hidden pt-20 pb-16 px-4">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-green-200/40 dark:bg-green-900/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-900/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold">
            <ShieldCheck className="w-4 h-4" />
            {lang === 'bn' ? 'কৃষকদের জন্য নির্ভরযোগ্য প্রযুক্তি' : 'Trusted Tech for Farmers'}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            {t('hero_title')}
            <span className="block text-green-600">{lang === 'bn' ? 'স্মার্ট কৃষি' : 'Smart Agriculture'}</span>
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onScanClick}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-600/30 transform hover:-translate-y-1 active:scale-95"
            >
              <Scan className="w-6 h-6" />
              {t('cta_scan')}
            </button>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 px-4">
              <span className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://picsum.photos/40/40?random=${i}`} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900" alt="avatar" />
                ))}
              </span>
              <span className="text-sm ml-2">5,000+ {lang === 'bn' ? 'কৃষক যুক্ত' : 'Farmers Active'}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative bg-white dark:bg-zinc-800 p-4 rounded-3xl shadow-2xl overflow-hidden group">
            <img 
              src="https://picsum.photos/600/600?agriculture" 
              className="w-full h-auto rounded-2xl transform transition-transform duration-700 group-hover:scale-110" 
              alt="Farmer checking crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Animated Cards */}
            <div className="absolute top-10 -left-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
              <div className="p-2 bg-green-100 rounded-lg">
                <Microscope className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">AI Accuracy</p>
                <p className="text-lg font-bold">98.4%</p>
              </div>
            </div>
            
            <div className="absolute bottom-10 -right-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow delay-500">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Expert Support</p>
                <p className="text-lg font-bold">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
