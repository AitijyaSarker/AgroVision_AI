'use client'

import { motion } from 'framer-motion'
import { Camera, Upload, Bot, User, MapPin, MessageCircle } from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { useI18n } from '@/lib/i18n/context'

const teamMembers = [
  {
    name: 'John Doe',
    nameBn: 'জন ডো',
    institution: 'University of Dhaka',
    institutionBn: 'ঢাকা বিশ্ববিদ্যালয়',
    department: 'Computer Science & Engineering',
    departmentBn: 'কম্পিউটার বিজ্ঞান ও প্রকৌশল',
    image: '/images/aitijya.png',
  },
  {
    name: 'Jane Smith',
    nameBn: 'জেন স্মিথ',
    institution: 'Bangladesh Agricultural University',
    institutionBn: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয়',
    department: 'Agricultural Engineering',
    departmentBn: 'কৃষি প্রকৌশল',
    image: '/team2.jpg',
  },
  {
    name: 'Ahmed Rahman',
    nameBn: 'আহমেদ রহমান',
    institution: 'BUET',
    institutionBn: 'বুয়েট',
    department: 'Electrical & Electronic Engineering',
    departmentBn: 'তড়িৎ ও ইলেকট্রনিক প্রকৌশল',
    image: '/team3.jpg',
  },
]

const roadmapSteps = [
  { icon: Camera, step: 1, title: 'Capture the doubted leaf', titleBn: 'সন্দেহজনক পাতা ক্যাপচার করুন' },
  { icon: Upload, step: 2, title: 'Submit image', titleBn: 'ছবি জমা দিন' },
  { icon: Bot, step: 3, title: 'AI detection & initial solution', titleBn: 'AI সনাক্তকরণ এবং প্রাথমিক সমাধান' },
  { icon: User, step: 4, title: 'Get help from specialist', titleBn: 'বিশেষজ্ঞের সাহায্য নিন' },
  { icon: MessageCircle, step: 5, title: 'Chat with nearest agri officer', titleBn: 'নিকটতম কৃষি কর্মকর্তার সাথে চ্যাট করুন' },
]

export default function AboutPage() {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Team Section */}
        <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold text-center mb-4 gradient-text"
            >
              {t('about.title')}
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl lg:text-3xl font-semibold text-center mb-12 text-gray-700 dark:text-gray-300"
            >
              {t('about.teamTitle')}
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass hover:shadow-2xl transition-all"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="aspect-square w-32 h-32 mx-auto mb-4 rounded-full object-cover"
                  />
                  <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                    {language === 'bn' ? member.nameBn : member.name}
                  </h3>
                  <p className="text-center text-primary-600 dark:text-primary-400 font-semibold mb-1">
                    {language === 'bn' ? member.institutionBn : member.institution}
                  </p>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    {language === 'bn' ? member.departmentBn : member.department}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-center mb-12 gradient-text"
            >
              {t('about.roadmap')}
            </motion.h2>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Connection Line */}
                <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 transform -translate-y-1/2" />
                
                <div className="grid lg:grid-cols-5 gap-6 relative">
                  {roadmapSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -10 }}
                      className="relative z-10"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 glass text-center hover:shadow-2xl transition-all">
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="w-8 h-8 mx-auto mb-3 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-bold">
                            {step.step}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {language === 'bn' ? step.titleBn : step.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

