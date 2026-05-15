'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
  AGRI_OFFICES,
  haversineKm,
  googleMapsDirectionsUrl,
  type AgriOffice,
} from '@/lib/agri-offices'

const MapComponent = dynamic(() => import('./map-component'), { ssr: false })

type LocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable'

const DEFAULT_LOCATION = { lat: 23.8103, lng: 90.4125 }

export default function FindOffice() {
  const { t, language } = useI18n()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading')
  const [selectedOffice, setSelectedOffice] = useState<AgriOffice | null>(null)

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unavailable')
      setUserLocation(DEFAULT_LOCATION)
      return
    }

    setLocationStatus('loading')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus('granted')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable')
        setUserLocation(DEFAULT_LOCATION)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(
            language === 'bn'
              ? 'লোকেশন অনুমতি দেওয়া হয়নি। ঢাকা কেন্দ্রে মানচিত্র দেখানো হচ্ছে।'
              : 'Location permission denied. Showing map centered on Dhaka.'
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    )
  }, [language])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const sortedOffices = [...AGRI_OFFICES].sort((a, b) => {
    if (!userLocation) return 0
    return (
      haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
    )
  })

  const statusLabel = {
    loading:
      language === 'bn' ? 'আপনার অবস্থান খুঁজছি...' : 'Finding your location...',
    granted:
      language === 'bn' ? 'লাইভ লোকেশন সক্রিয়' : 'Live location active',
    denied:
      language === 'bn'
        ? 'লোকেশন বন্ধ — ডিফল্ট মানচিত্র (ঢাকা)'
        : 'Location off — default map (Dhaka)',
    unavailable:
      language === 'bn' ? 'লোকেশন অনুপলব্ধ' : 'Location unavailable',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 glass"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.farmer.findOffice')}
            </h2>
          </div>

          <motion.div className="flex items-center gap-3">
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                locationStatus === 'granted'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}
            >
              {locationStatus === 'loading' && (
                <Loader2 className="inline h-4 w-4 animate-spin mr-1" />
              )}
              {statusLabel[locationStatus]}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={requestLocation}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary-300 dark:border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <RefreshCw className="h-4 w-4" />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </motion.button>
          </motion.div>
        </motion.div>

        {userLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 h-96 min-h-[384px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <MapComponent
              userLocation={userLocation}
              offices={AGRI_OFFICES}
              selectedOfficeId={selectedOffice?.id ?? null}
              onOfficeSelect={setSelectedOffice}
            />
          </motion.div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'bn' ? 'নিকটতম অফিস' : 'Nearest Offices'}
          </h3>

          {sortedOffices.map((office, index) => {
            const distance = userLocation
              ? haversineKm(userLocation.lat, userLocation.lng, office.lat, office.lng)
              : null
            const isSelected = selectedOffice?.id === office.id

            return (
              <motion.div
                key={office.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                onClick={() => setSelectedOffice(office)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start justify-between gap-4"
                >
                  <motion.div className="flex-1" whileHover={{ x: 2 }}>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'bn' ? office.nameBn : office.name}
                      {index === 0 && (
                        <span className="ml-2 text-xs font-normal text-primary-600">
                          {language === 'bn' ? '(নিকটতম)' : '(Nearest)'}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {language === 'bn' ? office.addressBn : office.address}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {office.phone}
                    </p>
                  </motion.div>
                  {distance !== null && (
                    <motion.div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary-600">
                        {distance.toFixed(1)} km
                      </p>
                      <Navigation className="h-4 w-4 text-primary-600 mx-auto mt-1" />
                    </motion.div>
                  )}
                </motion.div>

                {isSelected && userLocation && (
                  <motion.a
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    href={googleMapsDirectionsUrl(userLocation, office)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {language === 'bn' ? 'গুগল ম্যাপে দিকনির্দেশনা' : 'Directions in Google Maps'}
                  </motion.a>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
