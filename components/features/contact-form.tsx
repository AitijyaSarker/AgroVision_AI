'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ContactForm() {
  const { t, language } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = language === 'bn' ? 'নাম প্রয়োজন' : 'Name is required'
    }

    // Email or mobile should be provided
    if (!formData.email.trim() && !formData.mobile.trim()) {
      newErrors.contact = language === 'bn' 
        ? 'ইমেইল বা মোবাইল নম্বর প্রয়োজন' 
        : 'Email or mobile number is required'
    }

    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = language === 'bn' ? 'বৈধ ইমেইল দিন' : 'Please enter a valid email'
      }
    }

    // Validate mobile format if provided
    if (formData.mobile.trim()) {
      const mobileRegex = /^(\+880|880|0)?1[3-9]\d{8}$/
      const cleanMobile = formData.mobile.replace(/\s+/g, '')
      if (!mobileRegex.test(cleanMobile)) {
        newErrors.mobile = language === 'bn' 
          ? 'বৈধ মোবাইল নম্বর দিন (01XXXXXXXXX)' 
          : 'Please enter a valid mobile number (01XXXXXXXXX)'
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = language === 'bn' ? 'বার্তা প্রয়োজন' : 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে ফর্মটি সঠিকভাবে পূরণ করুন' : 'Please fill the form correctly')
      return
    }

    setIsSubmitting(true)

    try {
      // Try to save to Supabase database (contact_messages table)
      // If table doesn't exist, it will fall back to localStorage
      try {
        const { error } = await supabase
          .from('contact_messages')
          .insert({
            name: formData.name,
            email: formData.email || null,
            mobile: formData.mobile || null,
            message: formData.message,
            created_at: new Date().toISOString(),
          })

        if (error) {
          throw error
        }
      } catch (dbError: any) {
        // If table doesn't exist or other DB error, save to localStorage
        console.log('Saving to localStorage (DB not available):', dbError)
        const existing = JSON.parse(localStorage.getItem('contact_submissions') || '[]')
        localStorage.setItem('contact_submissions', JSON.stringify([
          ...existing,
          { ...formData, timestamp: new Date().toISOString() }
        ]))
      }

      setIsSubmitting(false)
      setIsSubmitted(true)
      toast.success(t('contact.success'))
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({ name: '', email: '', mobile: '', message: '' })
        setErrors({})
      }, 3000)
    } catch (error: any) {
      setIsSubmitting(false)
      toast.error(error.message || t('common.error'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass"
    >
      <h2 className="text-3xl font-bold mb-6 text-center gradient-text">
        {t('contact.title')}
      </h2>

      {isSubmitted ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700 dark:text-gray-300">
            {t('contact.success')}
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('contact.name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
              placeholder={t('contact.name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {language === 'bn' ? 'ইমেইল' : 'Email'} {language === 'bn' ? '(ঐচ্ছিক)' : '(Optional)'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'} {language === 'bn' ? '(ঐচ্ছিক)' : '(Optional)'}
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
              placeholder="01XXXXXXXXX"
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
            )}
            {errors.contact && (
              <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('contact.message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none`}
              placeholder={t('contact.message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>{t('contact.submit')}</span>
              </>
            )}
          </motion.button>
        </form>
      )}
    </motion.div>
  )
}

