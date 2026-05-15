'use client'

import { motion } from 'framer-motion'
import { Camera, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { useI18n } from '@/lib/i18n/context'
import ContactForm from '@/components/features/contact-form'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden animated-bg py-20 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 right-10 opacity-20"
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Sparkles className="h-32 w-32 text-primary-400" />
            </motion.div>
            <motion.div
              className="absolute bottom-20 left-10 opacity-20"
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Sparkles className="h-24 w-24 text-primary-400" />
            </motion.div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <motion.h1
                  className="text-5xl lg:text-7xl font-bold mb-6 gradient-text"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                >
                  {t('hero.title')}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8"
                >
                  {t('hero.subtitle')}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
                    >
                      <Camera className="h-6 w-6" />
                      <span>{t('hero.cta')}</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Cartoon Farmer Illustration */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  className="relative z-10"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 glass">
                    <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-900 dark:to-primary-700 rounded-2xl flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Camera className="h-32 w-32 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-primary-400 rounded-full opacity-20 blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500 rounded-full opacity-20 blur-2xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mid-Page Contact Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <ContactForm />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

