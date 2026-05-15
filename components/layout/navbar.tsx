'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Globe, Menu, X, Leaf } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!mounted) return null

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'datasets', href: '/datasets' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">
              {t('nav.home') === 'হোম' ? 'এগ্রো ভিশন' : 'Agro Vision'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <motion.div key={item.key} whileHover={{ y: -2 }}>
                <Link
                  href={item.href}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </motion.div>
            ))}

            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    {t('nav.dashboard')}
                  </Link>
                </motion.div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  {t('nav.signUp')}
                </Link>
              </motion.div>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white dark:bg-gray-900"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Globe className="h-5 w-5" />
                  <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
                </button>
                <motion.button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

