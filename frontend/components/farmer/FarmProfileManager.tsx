'use client'

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Sparkles, Check, Info, Droplets, Leaf, Shield, DollarSign, TrendingUp } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';

export interface FarmData {
  _id?: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  area: number;
  areaUnit: 'decimal' | 'bigha' | 'acre' | 'hectare';
  currentCrop: string;
  previousCrop: string;
  season: 'Kharif-1' | 'Kharif-2' | 'Rabi';
  soilType: 'alluvial' | 'clay' | 'sandy_loam' | 'silt_loam' | 'peat' | 'unknown';
  irrigation: 'full' | 'partial' | 'rainfed' | 'none';
  waterSource: 'groundwater' | 'canal' | 'pond' | 'rainwater' | 'none';
  priorities: string[];
}

interface FarmProfileManagerProps {
  lang: Language;
  farm: FarmData;
  onSaveFarm: (farm: FarmData) => void;
  isLoading?: boolean;
}

export const FarmProfileManager: React.FC<FarmProfileManagerProps> = ({
  lang,
  farm,
  onSaveFarm,
  isLoading = false,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  const [formData, setFormData] = useState<FarmData>(farm);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handlePriorityToggle = (priority: string) => {
    setFormData((prev) => {
      const exists = prev.priorities.includes(priority);
      const newPriorities = exists
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority];
      return { ...prev, priorities: newPriorities };
    });
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(lang === 'bn' ? 'আপনার ব্রাউজারে জিপিএস সুবিধা নেই।' : 'Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          locationName: prev.locationName || (lang === 'bn' ? 'বর্তমান জিপিএস অবস্থান' : 'Detected GPS Location'),
        }));
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsLoading(false);
        alert(lang === 'bn' ? 'জিপিএস অবস্থান সংগ্রহ করা যায়নি। অনুগ্রহ করে মান হাতে লিখুন।' : 'Unable to acquire GPS location. Please enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFarm(formData);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
  };

  const priorityOptions = [
    { id: 'soil_health', label: t('priority_soil_health'), icon: Leaf, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'lower_water', label: t('priority_lower_water'), icon: Droplets, color: 'text-sky-600 dark:text-sky-400' },
    { id: 'climate_resilience', label: t('priority_climate_resilience'), icon: Shield, color: 'text-amber-600 dark:text-amber-400' },
    { id: 'lower_cost', label: t('priority_lower_cost'), icon: DollarSign, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'yield_potential', label: t('priority_yield_potential'), icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Compass className="w-7 h-7 text-green-700 dark:text-green-400" />
            {t('farm_profile_title')}
          </h2>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            {lang === 'bn'
              ? 'আপনার খামারের অবস্থান ও তথ্য নির্ধারণ করুন, যার ওপর ভিত্তি করে নাসা স্যাটেলাইট ডেটা বিশ্লেষণ পরিচালিত হবে।'
              : 'Set your farm coordinates and field details to drive customized NASA Earth observation analysis.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          className="px-5 py-3 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/60 font-bold rounded-2xl border border-green-300 dark:border-green-800 transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? t('loading') : t('use_gps_btn')}
        </button>
      </div>

      {successNotice && (
        <div className="my-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{t('farm_saved_success')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Core Identity & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('farm_name_label')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              placeholder="e.g. Sylhet Green Valley Farm"
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('farm_location_label')}
            </label>
            <input
              type="text"
              required
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              placeholder="e.g. Sylhet Sadar"
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('latitude_label')}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('longitude_label')}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            />
          </div>
        </div>

        {/* Farm Area & Field Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
                {t('farm_area_label')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 1 })}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              />
            </div>
            <div className="w-36">
              <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
                {t('area_unit_label')}
              </label>
              <select
                value={formData.areaUnit}
                onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value as any })}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              >
                <option value="decimal">{t('unit_decimal')}</option>
                <option value="bigha">{t('unit_bigha')}</option>
                <option value="acre">{t('unit_acre')}</option>
                <option value="hectare">{t('unit_hectare')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('current_crop_label')}
            </label>
            <input
              type="text"
              value={formData.currentCrop}
              onChange={(e) => setFormData({ ...formData, currentCrop: e.target.value })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              placeholder="e.g. T. Aman Rice"
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('previous_crop_label')}
            </label>
            <input
              type="text"
              value={formData.previousCrop}
              onChange={(e) => setFormData({ ...formData, previousCrop: e.target.value })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
              placeholder="e.g. Aus Rice"
            />
          </div>
        </div>

        {/* Season, Soil & Water */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('target_season_label')}
            </label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            >
              <option value="Rabi">{t('season_rabi')}</option>
              <option value="Kharif-1">{t('season_kharif_1')}</option>
              <option value="Kharif-2">{t('season_kharif_2')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('soil_type_label')}
            </label>
            <select
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            >
              <option value="alluvial">{t('soil_alluvial')}</option>
              <option value="clay">{t('soil_clay')}</option>
              <option value="sandy_loam">{t('soil_sandy_loam')}</option>
              <option value="silt_loam">{t('soil_silt_loam')}</option>
              <option value="peat">{t('soil_peat')}</option>
              <option value="unknown">{t('soil_unknown')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('irrigation_label')}
            </label>
            <select
              value={formData.irrigation}
              onChange={(e) => setFormData({ ...formData, irrigation: e.target.value as any })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            >
              <option value="partial">{t('irrig_partial')}</option>
              <option value="full">{t('irrig_full')}</option>
              <option value="rainfed">{t('irrig_rainfed')}</option>
              <option value="none">{t('irrig_none')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-2">
              {t('water_source_label')}
            </label>
            <select
              value={formData.waterSource}
              onChange={(e) => setFormData({ ...formData, waterSource: e.target.value as any })}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white focus:ring-2 ring-green-600 outline-none"
            >
              <option value="groundwater">{t('source_groundwater')}</option>
              <option value="canal">{t('source_canal')}</option>
              <option value="pond">{t('source_pond')}</option>
              <option value="rainwater">{t('source_rainwater')}</option>
            </select>
          </div>
        </div>

        {/* Farmer Priorities Selection */}
        <div>
          <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block mb-3">
            {t('priorities_label')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {priorityOptions.map((opt) => {
              const selected = formData.priorities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePriorityToggle(opt.id)}
                  className={`p-4 rounded-2xl border font-bold text-left flex items-center justify-between transition-all ${
                    selected
                      ? 'bg-green-50 dark:bg-green-950/40 border-green-600 dark:border-green-500 text-green-900 dark:text-green-100 shadow-md scale-[1.01]'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <opt.icon className={`w-5 h-5 ${opt.color}`} />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selected
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl shadow-xl shadow-green-700/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-base"
          >
            <Sparkles className="w-5 h-5" />
            {isLoading ? t('loading') : t('save_farm_btn')}
          </button>
        </div>
      </form>
    </div>
  );
};
