
import React from 'react';
import { Sun, Moon, Languages, Leaf, UserCircle } from 'lucide-react';
import { Language, UserRole } from '../../types';
import { translations } from '../../translations';

interface NavbarProps {
  theme: 'light' | 'dark';
  currentPage: string;
  userRole: UserRole;
  onPageChange: (page: string) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  currentPage,
  userRole,
  onPageChange,
  onThemeChange,
  onLogout,
  lang,
  onLangChange,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onPageChange('home')}
        >
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:rotate-12 transition-transform">
            <Leaf className="w-6 h-6 text-green-700 dark:text-green-500" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
            {t('app_title')}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['home', 'datasets', 'about', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`text-sm font-black transition-colors ${
                currentPage === item 
                  ? 'text-green-700' 
                  : 'text-zinc-900 dark:text-zinc-400 hover:text-green-700 dark:hover:text-green-400'
              }`}
            >
              {t(`nav_${item}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onLangChange(lang === 'en' ? 'bn' : 'en')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-all"
          >
            <Languages className="w-5 h-5 text-zinc-900 dark:text-zinc-400" />
            <span className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-300">{lang}</span>
          </button>
          
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-zinc-900" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {userRole === 'guest' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange('login')}
                className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-black rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                {t('nav_login')}
              </button>
              <button
                onClick={() => onPageChange('register')}
                className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-black rounded-full transition-all shadow-lg shadow-green-700/20"
              >
                {t('nav_signup')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onPageChange('dashboard')}
                className="flex items-center gap-2 p-1.5 pl-3 pr-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-zinc-200 dark:border-zinc-700"
              >
                <UserCircle className="w-6 h-6 text-green-700 dark:text-green-500" />
                <span className="text-sm font-black capitalize text-zinc-900 dark:text-zinc-200">{userRole}</span>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-full transition-all"
              >
                {lang === 'bn' ? 'লগআউট' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
