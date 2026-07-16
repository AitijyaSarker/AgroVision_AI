
import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { AppLogo } from './common/AppLogo';
import { Language } from '../types';
import { translations } from '../translations';

export const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 py-16 px-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <AppLogo className="h-16 w-auto max-w-[200px] object-contain" alt="AgroVision" />
          <div className="flex gap-4">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-green-600 hover:shadow-lg transition-all border border-zinc-100 dark:border-zinc-700">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6">{lang === 'bn' ? 'লিঙ্ক' : 'Useful Links'}</h4>
          <ul className="space-y-4 text-zinc-500 text-sm font-medium">
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'গাইডলাইন' : 'Guide Lines'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'পলিসি' : 'Policy'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'গবেষণা' : 'Research'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'এপিআই' : 'API Access'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">{lang === 'bn' ? 'রিসোর্স' : 'Resources'}</h4>
          <ul className="space-y-4 text-zinc-500 text-sm font-medium">
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'রাইস ডিজিজ' : 'Rice Disease'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'ফার্টিলাইজার গাইড' : 'Fertilizer Guide'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'আবহাওয়া' : 'Weather Reports'}</li>
            <li className="hover:text-green-600 cursor-pointer">{lang === 'bn' ? 'বাজার দর' : 'Market Rates'}</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold mb-6">{lang === 'bn' ? 'নিউজলেটার' : 'Newsletter'}</h4>
          <p className="text-zinc-500 text-sm">{lang === 'bn' ? 'সাপ্তাহিক টিপস পেতে যুক্ত হন।' : 'Subscribe to get weekly farming tips.'}</p>
          <div className="flex gap-2 p-1.5 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <input type="email" placeholder="Email" className="bg-transparent flex-1 px-3 py-1 outline-none text-sm" />
            <button className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-xs hover:bg-green-700 transition-all">Join</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Team Agro Vision. Made with 💚 for Bangladesh.
      </div>
    </footer>
  );
};
