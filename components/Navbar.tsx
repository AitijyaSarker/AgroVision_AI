
import React from 'react';
import { Sun, Moon, Languages, UserCircle, LogOut } from 'lucide-react';
import { AppLogo } from './common/AppLogo';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  onLangChange: (l: Language) => void;
  theme: 'light' | 'dark';
  onThemeChange: (t: 'light' | 'dark') => void;
  currentPage: string;
  onPageChange: (p: string) => void;
  userRole: UserRole;
  onLogout?: () => void;
}

const ROLE_BN: Record<string, string> = {
  farmer: 'কৃষক',
  specialist: 'বিশেষজ্ঞ',
  guest: 'অতিথি',
};

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLangChange,
  theme,
  onThemeChange,
  currentPage,
  onPageChange,
  userRole,
  onLogout,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  const roleLabel =
    lang === 'bn'
      ? ROLE_BN[userRole] || userRole
      : userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-zinc-900 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onPageChange('home')}
        >
          <AppLogo
            className="h-14 w-auto max-w-[180px] object-contain group-hover:scale-105 transition-transform"
            alt="AgroVision"
            priority
          />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {['home', 'datasets', 'about', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                currentPage === item
                  ? 'text-green-600'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {t(`nav_${item}`)}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => onLangChange(lang === 'en' ? 'bn' : 'en')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-all"
            title={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
          >
            <Languages className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <span className="text-xs font-bold uppercase">{lang === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            title={theme === 'light' ? (lang === 'bn' ? 'ডার্ক মোড' : 'Dark mode') : (lang === 'bn' ? 'লাইট মোড' : 'Light mode')}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            )}
          </button>

          {/* Auth area */}
          {userRole === 'guest' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange('login')}
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors"
              >
                {t('nav_login')}
              </button>
              <button
                onClick={() => onPageChange('register')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full transition-all shadow-md shadow-green-600/20"
              >
                {t('nav_signup')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange('dashboard')}
                className="flex items-center gap-2 p-1 pl-3 pr-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-zinc-200 dark:border-zinc-700"
              >
                <UserCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-semibold">{roleLabel}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title={lang === 'bn' ? 'লগআউট' : 'Sign Out'}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-600 transition-all border border-zinc-200 dark:border-zinc-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
