'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Send, CheckCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function GetHelp() {
  const { t, language } = useI18n()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error(language === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please log in')
        return
      }

      // In a real app, save to database
      // For demo, just simulate
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Save request to database
      const { error } = await supabase
        .from('farmer_requests')
        .insert({
          farmer_id: user.id,
          farmer_name: user.user_metadata?.name || 'Farmer',
          message: message,
          crop_issue: 'General Inquiry',
          location: 'Dhaka, Bangladesh', // In real app, get from geolocation
        })

      if (error) throw error

      setIsSubmitted(true)
      toast.success(
        language === 'bn' 
          ? 'আপনার অনুরোধ পাঠানো হয়েছে! একজন বিশেষজ্ঞ শীঘ্রই আপনার সাথে যোগাযোগ করবেন।' 
          : 'Your request has been sent! A specialist will contact you soon.'
      )

      setTimeout(() => {
        setIsSubmitted(false)
        setMessage('')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass">
      <div className="flex items-center space-x-2 mb-6">
        <User className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.farmer.getHelp')}
        </h2>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700 dark:text-gray-300">
            {language === 'bn' 
              ? 'আপনার অনুরোধ পাঠানো হয়েছে!' 
              : 'Request sent successfully!'}
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {language === 'bn' ? 'আপনার সমস্যা বর্ণনা করুন' : 'Describe your problem'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              placeholder={language === 'bn' 
                ? 'আপনার ফসলের সমস্যা সম্পর্কে বিস্তারিত লিখুন...' 
                : 'Please describe your crop problem in detail...'}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
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
                <span>{language === 'bn' ? 'অনুরোধ পাঠান' : 'Send Request'}</span>
              </>
            )}
          </motion.button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {language === 'bn' 
              ? 'একজন কৃষি বিশেষজ্ঞ শীঘ্রই আপনার সাথে যোগাযোগ করবেন' 
              : 'An agricultural specialist will contact you shortly'}
          </p>
        </form>
      )}
    </div>
  )
}

