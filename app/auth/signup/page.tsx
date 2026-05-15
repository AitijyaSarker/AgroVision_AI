'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, UserCog, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

export default function SignUpPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'phone'>('role')
  const [role, setRole] = useState<'farmer' | 'specialist' | null>(null)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+880')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (selectedRole: 'farmer' | 'specialist') => {
    setRole(selectedRole)
    setStep('phone')
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhone = `${countryCode}${phone}`
      
      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          data: {
            role: role,
          },
        },
      })

      if (error) throw error

      toast.success(
        language === 'bn' 
          ? 'OTP পাঠানো হয়েছে! আপনার ফোন চেক করুন।' 
          : 'OTP sent! Please check your phone.'
      )
      
      // In a real app, you'd redirect to OTP verification page
      // For now, we'll just sign them in (you should implement OTP verification)
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass">
              <h1 className="text-3xl font-bold text-center mb-8 gradient-text">
                {t('auth.signUp')}
              </h1>

              {step === 'role' ? (
                <div className="space-y-4">
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    {language === 'bn' 
                      ? 'আপনি কীভাবে সাইন আপ করতে চান?' 
                      : 'How would you like to sign up?'}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('farmer')}
                    className="w-full p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 transition-all text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {t('auth.asFarmer')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'bn' 
                            ? 'ফসল স্ক্যান করুন এবং বিশেষজ্ঞের সাহায্য পান' 
                            : 'Scan crops and get help from specialists'}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary-600" />
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('specialist')}
                    className="w-full p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 transition-all text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <UserCog className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {t('auth.asSpecialist')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'bn' 
                            ? 'কৃষকদের সাহায্য করুন এবং পরামর্শ দিন' 
                            : 'Help farmers and provide expert advice'}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary-600" />
                    </div>
                  </motion.button>
                </div>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t('auth.countryCode')}
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="+880">+880 (Bangladesh)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t('auth.phoneNumber')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-400 ml-3 absolute" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="1XXX XXXXXX"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep('role')}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {language === 'bn' ? 'পিছনে' : 'Back'}
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? t('common.loading') : t('auth.continue')}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


