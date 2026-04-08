
import React from 'react';
import { Scan, ShieldCheck, Microscope, Users, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';

interface HeroProps {
  onGetStarted: () => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted, lang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <div className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
      {/* Full-Width Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom" 
          alt="Tractor in misty rice field" 
        />
        {/* Advanced Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent dark:from-zinc-950/80 dark:via-zinc-950/50 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Floating Cartoon Farmer Illustration */}
      <div className="absolute right-0 bottom-0 md:right-10 md:bottom-10 z-20 w-[300px] md:w-[450px] lg:w-[550px] pointer-events-none animate-float hidden lg:block">
        <img 
          src="/farmersticker.png" 
          className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
          alt="Farmer using Agro Vision AI"
          onError={(e) => {
            // Fallback if the IBB link is not available in the preview environment
            (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-300 text-sm font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" />
            {t('trusted_agri_tech')}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight">
              {t('hero_title')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                {t('smart_farming')}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-100/90 font-medium max-w-xl leading-relaxed drop-shadow-lg">
              {t('hero_subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-3 px-10 py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-green-600/40 transform hover:-translate-y-1 active:scale-95"
            >
              <Scan className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="text-lg">{t('cta_scan')}</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
            
            <div className="hidden sm:flex items-center gap-4 bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/20">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i} 
                    src={`https://picsum.photos/48/48?random=${i + 20}`} 
                    className="w-12 h-12 rounded-full border-2 border-green-600 shadow-xl" 
                    alt="Active user" 
                  />
                ))}
              </div>
              <div className="text-white">
                <p className="text-lg font-black leading-none">12.5k+</p>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-tighter">
                  {t('farmers_impacted')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid Overlay */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-400">
                <Microscope className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('ai_detection')}</span>
              </div>
              <p className="text-white font-bold text-lg">{t('accuracy_rate')}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('expert_help')}</span>
              </div>
              <p className="text-white font-bold text-lg">{t('response_time')}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes subtle-zoom {
          from { transform: scale(1.0); }
          to { transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite alternate ease-in-out;
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
