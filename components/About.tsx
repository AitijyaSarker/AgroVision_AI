
import React from 'react';
import { Language } from '../types';
import { Shield, Target, Award, Rocket } from 'lucide-react';

export const About: React.FC<{ lang: Language }> = ({ lang }) => {
  const team = [
    { name: 'Tanvir Mahtab', role: 'AI Lead', inst: 'BUET', img: 'https://picsum.photos/200/200?q=1' },
    { name: 'Nusrat Jahan', role: 'UI/UX Designer', inst: 'UIU', img: 'https://picsum.photos/200/200?q=2' },
    { name: 'Rashedul Islam', role: 'Backend Engineer', inst: 'SUST', img: 'https://picsum.photos/200/200?q=3' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl font-black">{lang === 'bn' ? 'আমাদের মিশন' : 'Our Mission'}</h2>
        <p className="text-lg text-zinc-500 leading-relaxed">
          {lang === 'bn' ? 
            'বাংলাদেশের কৃষি ব্যবস্থাকে প্রযুক্তির মাধ্যমে আধুনিকায়ন করা এবং কৃষকদের ফসলের সঠিক পরিচর্যার জন্য উন্নত প্রযুক্তি প্রদান করা আমাদের প্রধান লক্ষ্য।' : 
            'Our primary goal is to modernize Bangladesh\'s agricultural system through technology and provide farmers with advanced tools for proper crop care.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-8">
        {[
          { icon: Shield, val: '98%', label: lang === 'bn' ? 'নির্ভুলতা' : 'Accuracy' },
          { icon: Target, val: '24/7', label: lang === 'bn' ? 'সাপোর্ট' : 'Support' },
          { icon: Rocket, val: '10K+', label: lang === 'bn' ? 'ইউজার' : 'Users' },
          { icon: Award, val: 'Winner', label: lang === 'bn' ? 'এওয়ার্ড' : 'Awards' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 p-8 rounded-3xl text-center shadow-lg transform transition-all hover:-translate-y-2 border border-zinc-100 dark:border-zinc-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <s.icon className="text-green-600" />
            </div>
            <h4 className="text-3xl font-black mb-1">{s.val}</h4>
            <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="space-y-12">
        <h3 className="text-3xl font-bold text-center">{lang === 'bn' ? 'টিম নিউরাল নোডস' : 'Team Neural Nodes'}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((m, i) => (
            <div key={i} className="group relative bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-700 p-2">
              <img src={m.img} className="w-full h-64 object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500" alt={m.name} />
              <div className="p-6">
                <h4 className="text-xl font-black">{m.name}</h4>
                <p className="text-green-600 font-bold text-sm mb-1">{m.role}</p>
                <p className="text-zinc-500 text-xs">{m.inst}</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-white/80 dark:bg-zinc-900/80 p-2 rounded-xl backdrop-blur-md">
                   <div className="w-6 h-6 bg-blue-600 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
