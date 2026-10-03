'use client'

import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Thermometer, CloudRain, Droplets } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { FarmConditionReport } from '../../lib/nasa/normalizer';
import { runWhatIfSimulation, WhatIfSimulationResult } from '../../lib/engine/whatIfSimulator';
import { FarmData } from './FarmProfileManager';

interface WhatIfSimulatorViewProps {
  lang: Language;
  baseReport: FarmConditionReport | null;
  farm: FarmData;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  lang,
  baseReport,
  farm,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  const [rainfallDelta, setRainfallDelta] = useState<number>(0);
  const [tempDelta, setTempDelta] = useState<number>(0);
  const [moistureDelta, setMoistureDelta] = useState<number>(0);

  if (!baseReport) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-700 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-zinc-500 font-bold">{t('loading')}</p>
      </div>
    );
  }

  // Run deterministic simulation on the fly
  const simulation: WhatIfSimulationResult = runWhatIfSimulation(
    baseReport,
    farm.currentCrop,
    farm.previousCrop,
    farm.season,
    farm.soilType,
    farm.irrigation,
    farm.priorities,
    {
      rainfallDeltaPercent: rainfallDelta,
      tempDeltaCelsius: tempDelta,
      soilMoistureDeltaPercent: moistureDelta,
    }
  );

  const handleReset = () => {
    setRainfallDelta(0);
    setTempDelta(0);
    setMoistureDelta(0);
  };

  const isSimulated = rainfallDelta !== 0 || tempDelta !== 0 || moistureDelta !== 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Sliders className="w-7 h-7 text-green-700 dark:text-green-400" />
            {t('what_if_title')}
          </h2>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            {t('what_if_subtitle')}
          </p>
        </div>

        {isSimulated && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl transition-all flex items-center gap-2 text-xs shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('reset_sim_btn')}
          </button>
        )}
      </div>

      {/* Interactive Control Sliders */}
      <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 1. Rainfall Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              {t('rain_change_label')}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg ${
                rainfallDelta < 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : rainfallDelta > 0
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {rainfallDelta > 0 ? `+${rainfallDelta}%` : `${rainfallDelta}%`}
            </span>
          </div>

          <input
            type="range"
            min="-40"
            max="40"
            step="5"
            value={rainfallDelta}
            onChange={(e) => setRainfallDelta(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />

          <div className="flex justify-between text-[11px] font-bold text-zinc-400">
            <span>-40% (Drought)</span>
            <span>0% (Actual)</span>
            <span>+40% (Excess)</span>
          </div>
        </div>

        {/* 2. Temperature Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <Thermometer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {t('temp_change_label')}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg ${
                tempDelta > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : tempDelta < 0
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {tempDelta > 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}
            </span>
          </div>

          <input
            type="range"
            min="-2"
            max="4"
            step="0.5"
            value={tempDelta}
            onChange={(e) => setTempDelta(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />

          <div className="flex justify-between text-[11px] font-bold text-zinc-400">
            <span>-2°C (Cooler)</span>
            <span>0°C (Actual)</span>
            <span>+4°C (Heatwave)</span>
          </div>
        </div>

        {/* 3. Soil Moisture Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {t('soil_change_label')}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg ${
                moistureDelta < 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : moistureDelta > 0
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {moistureDelta > 0 ? `+${moistureDelta}%` : `${moistureDelta}%`}
            </span>
          </div>

          <input
            type="range"
            min="-30"
            max="30"
            step="5"
            value={moistureDelta}
            onChange={(e) => setMoistureDelta(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />

          <div className="flex justify-between text-[11px] font-bold text-zinc-400">
            <span>-30% (Dry Soil)</span>
            <span>0% (Actual)</span>
            <span>+30% (Saturated)</span>
          </div>
        </div>
      </div>

      {/* Simulated Impact Narrative */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
          {t('sim_impact_title')}
        </h3>
        <p className="text-base font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {lang === 'bn' ? simulation.impactSummaryBn : simulation.impactSummaryEn}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700/60 text-xs">
          <div>
            <span className="text-zinc-400 font-bold block">{t('card_temp_title')}</span>
            <span className="text-base font-black text-zinc-900 dark:text-white">
              {simulation.simulatedConditions.weather.currentTemp}°C
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-bold block">{t('thirty_day_rain')}</span>
            <span className="text-base font-black text-zinc-900 dark:text-white">
              {simulation.simulatedConditions.precipitation.recent30DaysMm} mm
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-bold block">{t('surface_wetness_label')}</span>
            <span className="text-base font-black text-zinc-900 dark:text-white">
              {(simulation.simulatedConditions.soilMoisture.surfaceWetness * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-zinc-400 font-bold block">{lang === 'bn' ? 'প্রধান ঝুঁকি' : 'Key Risk Signal'}</span>
            <span className="text-base font-black capitalize text-zinc-900 dark:text-white">
              {simulation.simulatedAssessment.overallSignal.key.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Recalculated Scenarios Under Simulation */}
      <div>
        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">
          {lang === 'bn' ? 'সিমুলেশন অনুযায়ী পরিবর্তিত ফসল উপযোগিতা' : 'Adjusted Crop Suitability Under This Climate Shift'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulation.simulatedRotation.scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {lang === 'bn' ? sc.titleBn : sc.titleEn}
                </span>
                <span className="text-lg font-black text-zinc-900 dark:text-white">
                  {lang === 'bn' ? sc.nextCrop.nameBn : sc.nextCrop.nameEn}
                </span>
                <span className="text-xs text-zinc-500 font-semibold block mt-0.5">
                  {t('scenario_water_fit')}: <span className="font-bold">{sc.nextCrop.waterNeed}</span>
                </span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-green-700 dark:text-green-400">
                  {sc.suitabilityScore}%
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t('scenario_suitability')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
