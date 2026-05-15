'use client'

import { motion } from 'framer-motion'
import { Database, ExternalLink, Leaf, Wheat } from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { useI18n } from '@/lib/i18n/context'

const datasets = [
  {
    name: 'Kaggle Plant Disease Dataset',
    nameBn: 'ক্যাগল উদ্ভিদ রোগ ডেটাসেট',
    icon: Database,
    description: 'Comprehensive dataset containing images of various plant diseases with high-quality annotations.',
    descriptionBn: 'বিভিন্ন উদ্ভিদ রোগের ছবি সহ উচ্চ-মানের অ্যানোটেশন সহ বিস্তৃত ডেটাসেট।',
    link: 'https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset',
  },
  {
    name: 'Rice Leaf Disease Dataset',
    nameBn: 'ধান পাতার রোগ ডেটাসেট',
    icon: Wheat,
    description: 'Specialized dataset focused on rice leaf diseases common in Bangladesh and South Asia.',
    descriptionBn: 'বাংলাদেশ এবং দক্ষিণ এশিয়ায় সাধারণ ধান পাতার রোগের উপর ফোকাস করা বিশেষায়িত ডেটাসেট।',
    link: 'https://www.kaggle.com/datasets/minhhuy2810/rice-diseases-image-dataset',
  },
  {
    name: 'Plant Village Dataset',
    nameBn: 'প্ল্যান্ট ভিলেজ ডেটাসেট',
    icon: Leaf,
    description: 'Large-scale dataset with 38 classes of plant diseases across multiple crop types.',
    descriptionBn: 'একাধিক ফসলের প্রকারের মধ্যে 38টি শ্রেণীর উদ্ভিদ রোগ সহ বৃহৎ-স্কেল ডেটাসেট।',
    link: 'https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset',
  },
]

export default function DatasetsPage() {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-center mb-4 gradient-text"
          >
            {t('datasets.title')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg"
          >
            {language === 'bn' 
              ? 'আমাদের AI মডেল প্রশিক্ষণের জন্য ব্যবহৃত ডেটাসেটগুলি' 
              : 'Datasets used to train our AI models'}
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {datasets.map((dataset, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass hover:shadow-2xl transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <dataset.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                
                <h3 className="text-xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                  {language === 'bn' ? dataset.nameBn : dataset.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
                  {language === 'bn' ? dataset.descriptionBn : dataset.description}
                </p>

                <motion.a
                  href={dataset.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{t('datasets.viewDataset')}</span>
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

