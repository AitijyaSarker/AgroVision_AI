'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Phone, ExternalLink, RefreshCw } from 'lucide-react';
import { Language } from '../../types';
import {
  AGRI_OFFICES,
  haversineKm,
  googleMapsDirectionsUrl,
  type AgriOffice,
} from '@/lib/agri-offices';

const OfficeLeafletMap = dynamic(() => import('./OfficeLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
    </div>
  ),
});

interface MapComponentProps {
  lang: Language;
}

const DEFAULT_LOCATION = { lat: 23.8103, lng: 90.4125 };

export const MapComponent: React.FC<MapComponentProps> = ({ lang }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [selectedOffice, setSelectedOffice] = useState<AgriOffice | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('ok');
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const sortedOffices = [...AGRI_OFFICES].sort((a, b) => {
    if (!userLocation) return 0;
    return (
      haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
    );
  });

  useEffect(() => {
    if (!selectedOffice && sortedOffices.length) {
      setSelectedOffice(sortedOffices[0]);
    }
  }, [sortedOffices, selectedOffice]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-bold">
          {lang === 'bn' ? 'নিকটতম কৃষি অফিস' : 'Nearest Agriculture Offices'}
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              locationStatus === 'ok'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            {locationStatus === 'loading'
              ? lang === 'bn'
                ? 'অবস্থান খুঁজছি...'
                : 'Finding location...'
              : locationStatus === 'ok'
                ? lang === 'bn'
                  ? 'লাইভ লোকেশন'
                  : 'Live location'
                : lang === 'bn'
                  ? 'ডিফল্ট (ঢাকা)'
                  : 'Default (Dhaka)'}
          </span>
          <button
            type="button"
            onClick={requestLocation}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-green-600 text-green-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <RefreshCw className="w-4 h-4" />
            {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-3 max-h-[520px] overflow-y-auto">
          {sortedOffices.map((office, index) => {
            const distance = userLocation
              ? haversineKm(userLocation.lat, userLocation.lng, office.lat, office.lng)
              : null;
            const isSelected = selectedOffice?.id === office.id;

            return (
              <button
                key={office.id}
                type="button"
                onClick={() => setSelectedOffice(office)}
                className={`w-full text-left p-4 bg-white dark:bg-zinc-800 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-zinc-100 dark:border-zinc-700 hover:border-green-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">
                      {lang === 'bn' ? office.nameBn : office.name}
                      {index === 0 && (
                        <span className="ml-1 text-xs text-green-600">
                          {lang === 'bn' ? '(নিকটতম)' : '(nearest)'}
                        </span>
                      )}
                    </h4>
                    {distance !== null && (
                      <p className="text-xs text-green-700 font-bold mt-1">
                        {distance.toFixed(1)} km
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {userLocation && (
            <OfficeLeafletMap
              userLocation={userLocation}
              offices={AGRI_OFFICES}
              selectedOfficeId={selectedOffice?.id ?? null}
              onOfficeSelect={setSelectedOffice}
            />
          )}

          {selectedOffice && userLocation && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold">{lang === 'bn' ? selectedOffice.nameBn : selectedOffice.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {selectedOffice.phone}
                </p>
              </div>
              <a
                href={googleMapsDirectionsUrl(userLocation, selectedOffice)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {lang === 'bn' ? 'গুগল ম্যাপে যান' : 'Directions'}
              </a>
            </div>
          )}

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Navigation className="w-4 h-4" />
            {lang === 'bn'
              ? 'মানচিত্রে সবুজ চিহ্ন = কৃষি অফিস, লাল = আপনার অবস্থান'
              : 'Green markers = agri offices, red = your location'}
          </div>
        </div>
      </div>
    </div>
  );
};

