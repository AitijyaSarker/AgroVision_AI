'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, X, CheckCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import toast from 'react-hot-toast'

interface DetectionResult {
  crop: string
  disease: string
  confidence: number
  solution: string
}

export default function CropScan() {
  const { t, language } = useI18n()
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = () => {
    setShowCamera(true)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(err => {
        toast.error(language === 'bn' ? 'ক্যামেরা অ্যাক্সেস করতে পারেনি' : 'Could not access camera')
      })
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg')
        setImage(dataUrl)
        setShowCamera(false)
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
        }
      }
    }
  }

  const handleDetect = async () => {
    if (!image) return

    setIsProcessing(true)
    setResult(null)

    try {
      const formData = new FormData()
      const response = await fetch(image)
      const blob = await response.blob()
      formData.append('file', blob, 'crop.jpg')
      formData.append('language', language)

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Analysis failed')
      }

      const data = await res.json()
      setResult({
        crop: data.crop,
        disease: data.disease,
        confidence: data.confidence,
        solution: data.solution,
      })
      toast.success(language === 'bn' ? 'রোগ সনাক্ত করা হয়েছে!' : 'Disease detected!')
    } catch {
      toast.error(
        language === 'bn'
          ? 'ছবি বিশ্লেষণ করা যায়নি। আবার চেষ্টা করুন।'
          : 'Could not analyze the image. Please try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setImage(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('dashboard.farmer.scanCrop')}
        </h2>

        {!image ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-12 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl hover:border-primary-500 transition-all flex flex-col items-center justify-center space-y-4"
              >
                <Upload className="h-12 w-12 text-primary-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('dashboard.farmer.uploadImage')}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCapture}
                className="p-12 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl hover:border-primary-500 transition-all flex flex-col items-center justify-center space-y-4"
              >
                <Camera className="h-12 w-12 text-primary-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('dashboard.farmer.captureImage')}
                </span>
              </motion.button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image}
                alt="Crop"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDetect}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              {isProcessing ? (
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
                  <Camera className="h-5 w-5" />
                  <span>{language === 'bn' ? 'রোগ সনাক্ত করুন' : 'Detect Disease'}</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full">
              <video
                ref={videoRef}
                autoPlay
                className="w-full rounded-lg mb-4"
              />
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold"
                >
                  {language === 'bn' ? 'ছবি তুলুন' : 'Capture'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowCamera(false)
                    if (videoRef.current?.srcObject) {
                      const stream = videoRef.current.srcObject as MediaStream
                      stream.getTracks().forEach(track => track.stop())
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass"
        >
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle className="h-6 w-6 text-primary-600" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.farmer.results')}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'bn' ? 'ফসল' : 'Crop'}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.crop}
                </p>
              </div>

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('dashboard.farmer.disease')}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.disease}
                </p>
              </div>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('dashboard.farmer.confidence')}
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    className="bg-primary-600 h-3 rounded-full"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.confidence}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboard.farmer.solution')}
              </p>
              <p className="text-gray-900 dark:text-white">
                {result.solution}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

