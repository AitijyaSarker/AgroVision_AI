
import React from 'react';
import { Sun, Moon, Languages, Leaf, UserCircle } from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  currentPage: string;
  setCurrentPage: (p: string) => void;
  userRole: UserRole;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  lang, setLang, theme, setTheme, currentPage, setCurrentPage, userRole 
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-zinc-900 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:rotate-12 transition-transform">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Agro Vision
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['home', 'datasets', 'about', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => setCurrentPage(item)}
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                currentPage === item ? 'text-green-600' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {t(`nav_${item}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-all"
          >
            <Languages className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <span className="text-xs font-bold uppercase">{lang}</span>
          </button>
          
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            )}
          </button>

          {userRole === 'guest' ? (
            <button
              onClick={() => setCurrentPage('signup')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full transition-all shadow-md shadow-green-600/20"
            >
              {t('nav_signup')}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2 p-1 pl-3 pr-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <UserCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-semibold capitalize">{userRole}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
