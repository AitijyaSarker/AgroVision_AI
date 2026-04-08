
import React from 'react';
import { Shield, Target, Award, Rocket } from 'lucide-react';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Language } from '../../types';

export const About: React.FC = () => {
  const { t, lang } = useTranslation();

  const team = [
    { name: 'Aitijya Sarker', role: 'Development Leader', inst: 'Metropolitan University', img: '/aitijya.png' },
    { name: 'Jubayer Rahman Chowdhury', role: 'Data Researcher and Model Trainer', inst: 'Metropolitan University', img: '/Jubayer.jpg' },
    { name: 'Anidro Paul', role: 'UI/UX Designer', inst: 'Metropolitan University', img: '/Anidro.jpg' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white">{t('about_mission_title')}</h2>
        <p className="text-lg text-zinc-800 dark:text-zinc-400 leading-relaxed font-bold">
          {t('about_mission_description')}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {[
          { icon: Shield, val: '98%', label: t('about_accuracy') },
          { icon: Target, val: '24/7', label: t('about_support') },
          { icon: Rocket, val: '10K+', label: t('about_users') },
          { icon: Award, val: 'Winner', label: t('about_awards') },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 p-8 rounded-3xl text-center shadow-lg transform transition-all hover:-translate-y-2 border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <s.icon className="text-green-700 dark:text-green-500" />
            </div>
            <h4 className="text-3xl font-black mb-1 text-zinc-900 dark:text-white">{s.val}</h4>
            <p className="text-zinc-800 dark:text-zinc-500 font-black uppercase text-xs tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        <h3 className="text-3xl font-black text-center text-zinc-900 dark:text-white uppercase tracking-tight">
          {t('about_team_title')}
        </h3>
        <div className="grid md:grid-cols-3 gap-12">
          {team.map((m, i) => (
            <div key={i} className="group flex flex-col items-center text-center">
              <div className="relative mb-6">
                {/* Glow Ring Effect */}
                <div className="absolute inset-0 rounded-full bg-green-500/0 group-hover:bg-green-500/20 blur-xl transition-all duration-500 scale-110" />
                
                {/* Image Container with Glow Hover */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-xl transition-all duration-500 group-hover:shadow-[0_0_30px_10px_rgba(34,197,94,0.4)] group-hover:scale-105 group-hover:border-green-600">
                  <img 
                    src={m.img} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    alt={m.name} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-500 transition-colors">{m.name}</h4>
                <p className="text-green-700 dark:text-green-500 font-black text-sm tracking-wide uppercase">{m.role}</p>
                <p className="text-zinc-800 dark:text-zinc-500 text-xs font-black">{m.inst}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
