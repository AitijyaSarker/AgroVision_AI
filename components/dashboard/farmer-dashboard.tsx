'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Bot, User, MapPin, Send, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import CropScan from '@/components/features/crop-scan'
import AIChatbot from '@/components/features/ai-chatbot'
import FindOffice from '@/components/features/find-office'
import GetHelp from '@/components/features/get-help'

export default function FarmerDashboard() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'scan' | 'chat' | 'help' | 'office'>('scan')

  const tabs = [
    { id: 'scan' as const, icon: Camera, label: t('dashboard.farmer.scanCrop') },
    { id: 'chat' as const, icon: Bot, label: t('dashboard.farmer.aiChatbot') },
    { id: 'help' as const, icon: User, label: t('dashboard.farmer.getHelp') },
    { id: 'office' as const, icon: MapPin, label: t('dashboard.farmer.findOffice') },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 gradient-text text-center"
      >
        {t('dashboard.farmer.title')}
      </motion.h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {activeTab === 'scan' && <CropScan />}
        {activeTab === 'chat' && <AIChatbot />}
        {activeTab === 'help' && <GetHelp />}
        {activeTab === 'office' && <FindOffice />}
      </motion.div>
    </div>
  )
}


