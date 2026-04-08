// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Mail } from 'lucide-react';
import { Language } from '../../types';

interface MapComponentProps {
  lang: Language;
}

interface Office {
  id: number;
  name: string;
  nameBn: string;
  address: string;
  addressBn: string;
  phone?: string;
  email?: string;
  type: string;
  typeBn: string;
}

const agriculturalOffices: Office[] = [
  {
    id: 1,
    name: 'Sylhet Agriculture Office',
    nameBn: 'সিলেট কৃষি অফিস',
    type: 'Upazila Agriculture Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    address: 'Sylhet, Bangladesh',
    addressBn: 'সিলেট, বাংলাদেশ',
    phone: '+880 821 714001',
    email: 'sylhet@agri.gov.bd'
  },
  {
    id: 2,
    name: 'Dhaka Agricultural Division',
    nameBn: 'ঢাকা কৃষি বিভাগ',
    type: 'Regional Agricultural Center',
    typeBn: 'আঞ্চলিক কৃষি কেন্দ্র',
    address: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ',
    phone: '+880 2 1234567',
    email: 'dhaka@agri.gov.bd'
  },
  {
    id: 3,
    name: 'Chittagong Agriculture Office',
    nameBn: 'চট্টগ্রাম কৃষি অফিস',
    type: 'Regional Agricultural Center',
    typeBn: 'আঞ্চলিক কৃষি কেন্দ্র',
    address: 'Chittagong, Bangladesh',
    addressBn: 'চট্টগ্রাম, বাংলাদেশ',
    phone: '+880 31 610001',
    email: 'chittagong@agri.gov.bd'
  },
  {
    id: 4,
    name: 'Khulna Agriculture Office',
    nameBn: 'খুলনা কৃষি অফিস',
    type: 'Regional Agricultural Center',
    typeBn: 'আঞ্চলিক কৃষি কেন্দ্র',
    address: 'Khulna, Bangladesh',
    addressBn: 'খুলনা, বাংলাদেশ',
    phone: '+880 41 720001',
    email: 'khulna@agri.gov.bd'
  },
  {
    id: 5,
    name: 'Rajshahi Agriculture Office',
    nameBn: 'রাজশাহী কৃষি অফিস',
    type: 'Regional Agricultural Center',
    typeBn: 'আঞ্চলিক কৃষি কেন্দ্র',
    address: 'Rajshahi, Bangladesh',
    addressBn: 'রাজশাহী, বাংলাদেশ',
    phone: '+880 721 770001',
    email: 'rajshahi@agri.gov.bd'
  }
];

export const MapComponent: React.FC<MapComponentProps> = ({ lang }) => {
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(agriculturalOffices[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(lang === 'bn' ? 'ভৌগোলিক অবস্থান সমর্থিত নয়' : 'Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => {
        setLocationError(lang === 'bn' ? 'অবস্থান অনুমতি প্রয়োজন' : 'Location permission required');
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Offices List */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xl font-bold">{lang === 'bn' ? 'কৃষি অফিস সমূহ' : 'Agriculture Offices'}</h3>
          <div className="space-y-3">
            {agriculturalOffices.map((office) => (
              <div
                key={office.id}
                onClick={() => setSelectedOffice(office)}
                className={`p-4 bg-white dark:bg-zinc-800 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                  selectedOffice?.id === office.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-zinc-100 dark:border-zinc-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg group-hover:bg-green-100 ${
                    selectedOffice?.id === office.id ? 'bg-green-100' : 'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">
                      {lang === 'bn' ? office.nameBn : office.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {lang === 'bn' ? office.typeBn : office.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Map Area */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {/* Map Demo Background */}
          <div className="h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-zinc-700 dark:to-zinc-600 relative overflow-hidden flex items-center justify-center">
            {/* Decorative map icon */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-12 left-12 w-24 h-24 border-4 border-green-600 rounded-full"></div>
              <div className="absolute bottom-20 right-16 w-32 h-32 border-4 border-blue-600 rounded-full"></div>
            </div>

            {selectedOffice && (
              <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-6 border-2 border-green-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {lang === 'bn' ? selectedOffice.nameBn : selectedOffice.name}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      {lang === 'bn' ? selectedOffice.typeBn : selectedOffice.type}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                        {lang === 'bn' ? 'ঠিকানা' : 'Address'}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {lang === 'bn' ? selectedOffice.addressBn : selectedOffice.address}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {selectedOffice.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === 'bn' ? 'ফোন' : 'Phone'}
                        </p>
                        <a href={`tel:${selectedOffice.phone}`} className="text-sm text-green-600 hover:text-green-700 dark:hover:text-green-400">
                          {selectedOffice.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {selectedOffice.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                          {lang === 'bn' ? 'ইমেইল' : 'Email'}
                        </p>
                        <a href={`mailto:${selectedOffice.email}`} className="text-sm text-green-600 hover:text-green-700 dark:hover:text-green-400 truncate">
                          {selectedOffice.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {lang === 'bn' ? '📍 অফিস অবস্থান তথ্য' : '📍 Office Location Information'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location Button */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
            <button
              onClick={requestLocation}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white font-semibold rounded-xl transition-all"
            >
              <Navigation className="w-4 h-4" />
              {loading 
                ? (lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...') 
                : (lang === 'bn' ? 'আমার অবস্থান' : 'My Location')
              }
            </button>
            {locationError && (
              <p className="text-xs text-red-600 dark:text-red-400">{locationError}</p>
            )}
            {userLocation && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ {lang === 'bn' ? 'অবস্থান সক্রিয়' : 'Location active'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
