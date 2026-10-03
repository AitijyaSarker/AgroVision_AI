'use client'

import { LanguageProvider } from '@/src/hooks/useTranslation'

export function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}

export default LanguageProviderWrapper
