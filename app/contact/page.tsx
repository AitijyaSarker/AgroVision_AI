'use client'

import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ContactForm from '@/components/features/contact-form'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n/context'

export default function ContactPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <ContactForm />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


