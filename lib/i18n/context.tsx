'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('bn')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
      setLanguage(savedLang)
    }
  }, [])

  const setLanguageWithStorage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = (translations as any)[language]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: setLanguageWithStorage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

