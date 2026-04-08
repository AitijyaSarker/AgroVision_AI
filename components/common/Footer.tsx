import React from 'react';
import { Leaf, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <footer className="bg-zinc-100 dark:bg-zinc-900 py-20 px-6 border-t border-zinc-300 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Branding & Social */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-700 rounded-xl shadow-lg shadow-green-700/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Agro Vision
            </span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-400 text-sm font-bold leading-relaxed max-w-xs">
            {t('footer_text')}
          </p>
          <div className="flex gap-3">
            {[
              { Icon: Facebook, href: '#', color: 'hover:text-blue-600' },
              { Icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
              { Icon: Twitter, href: '#', color: 'hover:text-sky-500' },
              { Icon: Instagram, href: '#', color: 'hover:text-pink-600' },
            ].map(({ Icon, href, color }, i) => (
              <a 
                key={i} 
                href={href} 
                className={`w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 border border-zinc-300 dark:border-zinc-700 transition-all hover:shadow-xl hover:-translate-y-1 ${color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-black mb-8 text-zinc-900 dark:text-white">
            {t('footer_quick_links')}
          </h4>
          <ul className="space-y-4">
            {['home', 'datasets', 'about', 'contact'].map((item) => (
              <li key={item}>
                <a href={`#${item}`} className="text-zinc-700 dark:text-zinc-400 text-sm font-black hover:text-green-700 dark:hover:text-green-400 transition-colors flex items-center gap-2 group">
                  <div className="w-2 h-2 rounded-full bg-green-700 scale-0 group-hover:scale-100 transition-transform" />
                  {t(`nav_${item}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-1">
          <h4 className="text-lg font-black mb-8 text-zinc-900 dark:text-white">
            {t('footer_get_in_touch')}
          </h4>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Mail className="w-5 h-5 text-green-700 dark:text-green-500" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">{t('footer_email')}</p>
                <a href="mailto:support@agrovision.bd" className="text-sm font-black text-zinc-900 dark:text-white hover:text-green-700 transition-colors">
                  support@agrovision.bd
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Phone className="w-5 h-5 text-blue-700 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">{t('footer_call_us')}</p>
                <a href="tel:+8801712345678" className="text-sm font-black text-zinc-900 dark:text-white hover:text-green-700 transition-colors">
                  +880 1712-345678
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <MapPin className="w-5 h-5 text-orange-700 dark:text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1">{t('footer_office')}</p>
                <p className="text-sm font-black text-zinc-900 dark:text-white">Banani, Dhaka, Bangladesh</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Newsletter / Meta */}
        <div className="space-y-6">
          <h4 className="text-lg font-black mb-2 text-zinc-900 dark:text-white">
            {t('footer_newsletter')}
          </h4>
          <p className="text-zinc-700 dark:text-zinc-400 text-sm font-bold">
            {t('footer_newsletter_description')}
          </p>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="email@example.com"
              className="w-full px-5 py-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none transition-all shadow-sm group-hover:shadow-md"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-black rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-green-700/20">
              {t('footer_join')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-zinc-300 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 text-xs font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.2em]">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="hidden md:block">•</span>
          <span className="text-green-700 dark:text-green-500">Neural Nodes</span>
          <span className="hidden md:block">•</span>
          <span>Made with 💚 for Bangladesh</span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="text-[10px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-widest hover:text-green-700 transition-colors">{t('footer_privacy')}</a>
          <a href="#" className="text-[10px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-widest hover:text-green-700 transition-colors">{t('footer_terms')}</a>
          <a href="#" className="text-[10px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-widest hover:text-green-700 transition-colors">{t('footer_cookies')}</a>
        </div>
      </div>
    </footer>
  );
};