'use client'

import React, { useState } from 'react';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Satellite,
  TrendingDown,
  TrendingUp,
  Minus,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { FarmConditionReport } from '../../lib/nasa/normalizer';
import { FarmStressAssessment } from '../../lib/engine/stressEngine';

interface CurrentConditionsViewProps {
  lang: Language;
  report: FarmConditionReport | null;
  assessment: FarmStressAssessment | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CurrentConditionsView: React.FC<CurrentConditionsViewProps> = ({
  lang,
  report,
  assessment,
  onRefresh,
  isLoading = false,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (isLoading || !report || !assessment) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-700 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          {lang === 'bn' ? 'নাসা স্যাটেলাইট পর্যবেক্ষণ সংগ্রহ করা হচ্ছে...' : 'Fetching NASA Earth observations...'}
        </h3>
        <p className="text-zinc-500 text-sm mt-2">
          {lang === 'bn' ? 'আবহাওয়া, বৃষ্টিপাত ও মাটির আর্দ্রতা বিশ্লেষণ চলছে' : 'Querying NASA POWER, GPM IMERG, and SMAP data'}
        </p>
      </div>
    );
  }

  const { weather, precipitation, soilMoisture, vegetation } = report;
  const { overallSignal, waterStress, excessWaterRisk, heatStress, vegetationStress, currentVsNormal } = assessment;

  // Signal severity badge colors
  const severityColors = {
    normal: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    caution: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    warning: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-200',
    critical: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200',
  }[overallSignal.severity];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Scientific Attribution Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
              {t('conditions_header')}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-sm">
              <Satellite className="w-3.5 h-3.5" />
              {t('nasa_area_estimate_badge')}
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            {report.locationName} • Lat: {report.latitude.toFixed(3)}, Lon: {report.longitude.toFixed(3)}
          </p>
        </div>

        <div className="text-xs text-zinc-500 font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{t('last_updated')}: {new Date(report.fetchedAt).toLocaleDateString()}</span>
          {report.isCached && (
            <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {t('data_quality_cached')}
            </span>
          )}
        </div>
      </div>

      {/* Dominant Environmental Signal Banner */}
      <div className={`p-6 rounded-3xl border shadow-lg ${severityColors} flex items-start gap-4`}>
        {overallSignal.severity === 'normal' ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black tracking-tight">
              {lang === 'bn' ? overallSignal.titleBn : overallSignal.titleEn}
            </h3>
            <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10">
              {overallSignal.severity.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold opacity-90">
            {lang === 'bn' ? overallSignal.summaryBn : overallSignal.summaryEn}
          </p>
        </div>
      </div>

      {/* Four Core NASA Observation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Temperature Card */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Thermometer className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-400">NASA POWER</span>
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
            {t('card_temp_title')}
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black text-zinc-900 dark:text-white">
              {weather.currentTemp}°C
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                weather.tempAnomaly > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {weather.tempAnomaly > 0 ? `+${weather.tempAnomaly}°C` : `${weather.tempAnomaly}°C`}
            </span>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>{t('max_temp_label')}:</span>
              <span className="text-zinc-900 dark:text-white">{weather.tempMax}°C</span>
            </div>
            <div className="flex justify-between">
              <span>{t('min_temp_label')}:</span>
              <span className="text-zinc-900 dark:text-white">{weather.tempMin}°C</span>
            </div>
            <div className="flex justify-between">
              <span>{t('humidity_label')}:</span>
              <span className="text-zinc-900 dark:text-white">{weather.relativeHumidity}%</span>
            </div>
          </div>
        </div>

        {/* 2. Precipitation Card */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-2xl">
              <CloudRain className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-400">NASA GPM</span>
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
            {t('card_precip_title')}
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black text-zinc-900 dark:text-white">
              {precipitation.recent7DaysMm}
            </span>
            <span className="text-sm font-bold text-zinc-500">mm (7d)</span>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>{t('thirty_day_rain')}:</span>
              <span className="text-zinc-900 dark:text-white">{precipitation.recent30DaysMm} mm</span>
            </div>
            <div className="flex justify-between">
              <span>{t('departure_label')}:</span>
              <span
                className={
                  precipitation.departurePercentage < -15
                    ? 'text-amber-600 dark:text-amber-400'
                    : precipitation.departurePercentage > 20
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }
              >
                {precipitation.departurePercentage > 0 ? `+${precipitation.departurePercentage}%` : `${precipitation.departurePercentage}%`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Soil Moisture Card */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Droplets className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-400">NASA SMAP</span>
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
            {t('card_soil_title')}
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black text-zinc-900 dark:text-white">
              {(soilMoisture.surfaceWetness * 100).toFixed(0)}%
            </span>
            <span className="text-sm font-bold text-zinc-500">wetness</span>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>{t('root_wetness_label')}:</span>
              <span className="text-zinc-900 dark:text-white">{(soilMoisture.rootZoneWetness * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('trend_label')}:</span>
              <span className="capitalize text-zinc-900 dark:text-white">
                {soilMoisture.trend === 'drying' ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'শুকিয়ে যাচ্ছে' : 'Drying'}
                  </span>
                ) : soilMoisture.trend === 'increasing' ? (
                  <span className="flex items-center gap-1 text-teal-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'আর্দ্রতা বাড়ছে' : 'Increasing'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Minus className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'স্থিতিশীল' : 'Stable'}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Vegetation Condition Card */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-400">NASA HLS</span>
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
            {t('card_veg_title')}
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black text-zinc-900 dark:text-white">
              {vegetation.ndviValue.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-zinc-500">NDVI</span>
          </div>
          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>{lang === 'bn' ? 'বৃদ্ধির অবস্থা' : 'Canopy Health'}:</span>
              <span className="capitalize text-emerald-700 dark:text-emerald-300 font-black">
                {vegetation.vegetationCondition}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('trend_label')}:</span>
              <span className="capitalize text-zinc-900 dark:text-white">{vegetation.thirtyDayTrend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Climatological Comparison Breakdown */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-green-700 dark:text-green-400" />
          {t('current_vs_normal_title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-500">{t('departure_label')}</span>
            <div className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">
              {currentVsNormal.rainfallDeparture > 0 ? `+${currentVsNormal.rainfallDeparture}%` : `${currentVsNormal.rainfallDeparture}%`}
            </div>
            <p className="text-xs font-semibold text-zinc-500 mt-2">
              {currentVsNormal.rainfallDeparture < -15
                ? t('below_normal_status')
                : currentVsNormal.rainfallDeparture > 20
                ? t('above_normal_status')
                : t('near_normal_status')}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-500">{t('temp_departure_label')}</span>
            <div className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">
              {currentVsNormal.tempAnomaly > 0 ? `+${currentVsNormal.tempAnomaly}°C` : `${currentVsNormal.tempAnomaly}°C`}
            </div>
            <p className="text-xs font-semibold text-zinc-500 mt-2">
              {Math.abs(currentVsNormal.tempAnomaly) < 1.0
                ? (lang === 'bn' ? 'স্বাভাবিক তাপমাত্রার সীমায়' : 'Within normal seasonal range')
                : currentVsNormal.tempAnomaly > 0
                ? (lang === 'bn' ? 'স্বাভাবিকের চেয়ে কিছুটা উষ্ণ' : 'Warmer than typical baseline')
                : (lang === 'bn' ? 'স্বাভাবিকের চেয়ে কিছুটা শীতল' : 'Cooler than typical baseline')}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-500">{t('card_soil_title')}</span>
            <div className="text-2xl font-black mt-1 capitalize text-zinc-900 dark:text-white">
              {soilMoisture.status.replace('_', ' ')}
            </div>
            <p className="text-xs font-semibold text-zinc-500 mt-2">
              {lang === 'bn'
                ? `উপরিভাগ: ${(soilMoisture.surfaceWetness * 100).toFixed(0)}%, শিকড়: ${(soilMoisture.rootZoneWetness * 100).toFixed(0)}%`
                : `Top: ${(soilMoisture.surfaceWetness * 100).toFixed(0)}%, Root: ${(soilMoisture.rootZoneWetness * 100).toFixed(0)}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Technical Details & Limitations Accordion */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-3xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-5 flex items-center justify-between text-left font-black text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'bn' ? 'প্রযুক্তিগত তথ্য ও ডেটার সীমাবদ্ধতা' : 'Technical Details & Scientific Limitations'}</span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-bold space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed animate-in slide-in-from-top-1">
            <p>{t('scientific_honesty_notice')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-900 dark:text-white font-black block mb-1">NASA POWER (0.5° × 0.5°):</span>
                <span>{weather.provenance.citation}</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-900 dark:text-white font-black block mb-1">NASA GPM IMERG (0.1° × 0.1°):</span>
                <span>{precipitation.provenance.citation}</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-900 dark:text-white font-black block mb-1">NASA SMAP Catchment (9 km):</span>
                <span>{soilMoisture.provenance.citation}</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-900 dark:text-white font-black block mb-1">NASA HLS / MODIS (30m - 250m):</span>
                <span>{vegetation.provenance.citation}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
