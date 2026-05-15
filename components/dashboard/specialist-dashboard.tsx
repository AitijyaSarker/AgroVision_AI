'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, X as XIcon, MessageCircle, Send } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface FarmerRequest {
  id: string
  farmer_id: string
  farmer_name: string
  message: string
  crop_issue: string
  location: string
  created_at: string
}

export default function SpecialistDashboard() {
  const { t, language } = useI18n()
  const [requests, setRequests] = useState<FarmerRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<FarmerRequest | null>(null)

  useEffect(() => {
    loadRequests()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('farmer_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'farmer_requests' },
        () => {
          loadRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadRequests = async () => {
    // In a real app, fetch from database
    // For demo, using mock data
    const mockRequests: FarmerRequest[] = [
      {
        id: '1',
        farmer_id: 'farmer1',
        farmer_name: language === 'bn' ? 'রহিম উদ্দিন' : 'Rahim Uddin',
        message: language === 'bn' ? 'আমার ধানের পাতায় হলুদ দাগ দেখা যাচ্ছে' : 'Yellow spots appearing on my rice leaves',
        crop_issue: 'Rice Leaf Disease',
        location: 'Dhaka, Bangladesh',
        created_at: new Date().toISOString(),
      },
    ]
    setRequests(mockRequests)
  }

  const handleAccept = async (requestId: string) => {
    toast.success(language === 'bn' ? 'অনুরোধ গ্রহণ করা হয়েছে' : 'Request accepted')
    setSelectedRequest(requests.find(r => r.id === requestId) || null)
    // In real app, update database and start chat
  }

  const handleIgnore = async (requestId: string) => {
    setRequests((prev: FarmerRequest[]) => prev.filter((r: FarmerRequest) => r.id !== requestId))
    toast.success(language === 'bn' ? 'অনুরোধ উপেক্ষা করা হয়েছে' : 'Request ignored')
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 gradient-text text-center"
      >
        {t('dashboard.specialist.title')}
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Notifications Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.specialist.notifications')}
              </h2>
            </div>

            {requests.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                {t('dashboard.specialist.noRequests')}
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((request: FarmerRequest) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.farmer_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.location}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {request.message}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm">
                        {request.crop_issue}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg font-semibold"
                      >
                        <Check className="h-4 w-4" />
                        <span>{t('dashboard.specialist.accept')}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleIgnore(request.id)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <XIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass h-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('dashboard.specialist.chat')}
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedRequest.farmer_name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRequest.message}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'বার্তা লিখুন...' : 'Type a message...'}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 glass h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {language === 'bn' 
                    ? 'একটি অনুরোধ গ্রহণ করুন চ্যাট শুরু করতে' 
                    : 'Accept a request to start chatting'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

