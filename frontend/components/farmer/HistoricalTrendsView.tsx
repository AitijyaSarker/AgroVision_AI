'use client'

import React from 'react';
import { Calendar, TrendingUp, CloudRain, Thermometer, Droplets, Info } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';
import { FarmConditionReport } from '../../lib/nasa/normalizer';

interface HistoricalTrendsViewProps {
  lang: Language;
  report: FarmConditionReport | null;
}

export const HistoricalTrendsView: React.FC<HistoricalTrendsViewProps> = ({
  lang,
  report,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  if (!report) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-700 shadow-xl">
        <p className="text-zinc-500 font-bold">{t('loading')}</p>
      </div>
    );
  }

  const { weather, precipitation, soilMoisture } = report;
  const history = weather.dailyHistory || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-green-700 dark:text-green-400" />
          {t('historical_trends_title')}
        </h2>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
          {t('historical_trends_sub')}
        </p>
      </div>

      {/* 14-Day Timeline Bar Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-700 shadow-xl overflow-x-auto">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-6 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-600" />
          {lang === 'bn' ? 'গত ১৪ দিনের তাপমাত্রা ও বৃষ্টিপাত (নাসা পাওয়ার)' : '14-Day Temperature & Rainfall Timeline (NASA POWER)'}
        </h3>

        <div className="min-w-[650px] space-y-3">
          {history.map((day, idx) => {
            const tempPercent = Math.min(100, Math.max(10, ((day.temp - 15) / 25) * 100));
            const rainPercent = Math.min(100, (day.precipitation / 25) * 100);

            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 text-xs font-bold"
              >
                <span className="col-span-2 text-zinc-500 font-mono">
                  {day.date.substring(5)}
                </span>

                {/* Temp Visual Bar */}
                <div className="col-span-5 flex items-center gap-2">
                  <span className="w-12 text-zinc-900 dark:text-white">{day.temp}°C</span>
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${tempPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {day.tempMin}° / {day.tempMax}°
                  </span>
                </div>

                {/* Rain Visual Bar */}
                <div className="col-span-5 flex items-center gap-2">
                  <span className="w-14 text-sky-700 dark:text-sky-300 font-black">
                    {day.precipitation} mm
                  </span>
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${rainPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provenance note */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-500 flex items-center gap-3">
        <Info className="w-4 h-4 flex-shrink-0 text-zinc-400" />
        <span>
          {lang === 'bn'
            ? 'দৈনিক তথ্যসমূহ নাসা মার্জড স্যাটেলাইট ও বায়ুমণ্ডলীয় বিশ্লেষণ (MERRA-2 ও GPM IMERG) থেকে প্রাপ্ত।'
            : 'Daily time-series is derived from NASA assimilated satellite & reanalysis grids (MERRA-2 & GPM IMERG).'}
        </span>
      </div>
    </div>
  );
};
