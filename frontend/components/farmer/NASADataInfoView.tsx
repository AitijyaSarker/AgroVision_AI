'use client'

import React from 'react';
import { Database, ShieldCheck, ExternalLink, Globe, Layers, AlertCircle } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';

interface NASADataInfoViewProps {
  lang: Language;
}

export const NASADataInfoView: React.FC<NASADataInfoViewProps> = ({ lang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;

  const datasets = [
    {
      name: 'NASA POWER',
      titleEn: 'Prediction of Worldwide Energy Resources',
      titleBn: 'বিশ্বব্যাপী শক্তি ও কৃষি-আবহাওয়া সম্পদ',
      roleEn: 'Provides daily solar radiation, 2-meter air temperature, humidity, and climatological normals.',
      roleBn: 'দৈনিক সৌর বিকিরণ, ২-মিটার বাতাসের তাপমাত্রা, আর্দ্রতা এবং জলবায়ু স্বাভাবিক গড় প্রদান করে।',
      resolution: '0.5° × 0.5° (~50 km)',
      citation: 'NASA Langley Research Center POWER Project',
      url: 'https://power.larc.nasa.gov/',
    },
    {
      name: 'NASA GPM IMERG',
      titleEn: 'Global Precipitation Measurement Integrated Multi-satellitE Retrievals',
      titleBn: 'গ্লোবাল প্রিসিপিটেশন মেজারমেন্ট মাল্টি-স্যাটেলাইট বৃষ্টিপাত',
      roleEn: 'Tracks daily and cumulative rainfall accumulation, drought deficit, and intense precipitation events.',
      roleBn: 'দৈনিক ও পুঞ্জীভূত বৃষ্টিপাত, খরার ঘাটতি এবং ভারী বর্ষণের চিত্র ট্র্যাক করে।',
      resolution: '0.1° × 0.1° (~10 km)',
      citation: 'NASA Goddard Space Flight Center GPM Science Team',
      url: 'https://gpm.nasa.gov/',
    },
    {
      name: 'NASA SMAP',
      titleEn: 'Soil Moisture Active Passive Mission (L4 Catchment Model)',
      titleBn: 'সয়েল মইশ্চার অ্যাক্টিভ প্যাসিভ (মাটির আর্দ্রতা মিশন)',
      roleEn: 'Estimates 0-5 cm surface soil wetness and root-zone water content to detect drought or waterlogging risks.',
      roleBn: 'মাটির উপরিভাগ (০-৫ সেমি) এবং শিকড় অঞ্চলের আর্দ্রতা প্রাক্কলন করে পানির সংকট বা জলাবদ্ধতা নির্ণয় করে।',
      resolution: '9 km / 0.5° assimilation grid',
      citation: 'NASA Jet Propulsion Laboratory & GSFC',
      url: 'https://smap.jpl.nasa.gov/',
    },
    {
      name: 'NASA HLS & MODIS',
      titleEn: 'Harmonized Landsat Sentinel-2 & MODIS Vegetation Greenness',
      titleBn: 'হারমোনাইজড ল্যান্ডস্যাট সেন্টিনেল-২ ও মডিস সবুজভাব সূচক',
      roleEn: 'Computes Normalized Difference Vegetation Index (NDVI) to assess crop canopy vigor and 30-day greenness trends.',
      roleBn: 'ফসলের বৃদ্ধি ও পাতার ঘনত্ব যাচাইয়ে এনডিভিআই (NDVI) সূচক এবং ৩০ দিনের বৃদ্ধির গতি পর্যবেক্ষণ করে।',
      resolution: '30 m (HLS) / 250 m (MODIS)',
      citation: 'NASA LP DAAC / USGS Land Processes',
      url: 'https://hls.gsfc.nasa.gov/',
    },
    {
      name: 'NASA GIBS',
      titleEn: 'Global Imagery Browse Services',
      titleBn: 'গ্লোবাল ইমেজারি ব্রাউজ সার্ভিসেস',
      roleEn: 'Serves daily full-resolution satellite imagery tiles (True Color, SMAP, GPM radar) for interactive farm mapping.',
      roleBn: 'ইন্টারেক্টিভ খামার ম্যাপের জন্য প্রতিদিনের স্যাটেলাইট চিত্র (ন্যাচারাল কালার, আর্দ্রতা স্তর) সরবরাহ করে।',
      resolution: 'Web Mercator WMTS Tiles',
      citation: 'NASA Earth Observing System Data and Information System (EOSDIS)',
      url: 'https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
          <Database className="w-7 h-7 text-green-700 dark:text-green-400" />
          {t('nasa_provenance_title')}
        </h2>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
          {t('nasa_provenance_sub')}
        </p>
      </div>

      {/* Scientific Honesty Notice Banner */}
      <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-4 shadow-sm">
        <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs font-bold leading-relaxed">
          <h4 className="text-sm font-black mb-1">
            {lang === 'bn' ? 'বৈজ্ঞানিক সততা ও তথ্যের সীমাবদ্ধতা' : 'Scientific Honesty & Data Limitations'}
          </h4>
          <p>{t('scientific_honesty_notice')}</p>
        </div>
      </div>

      {/* Dataset Provenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map((d, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400">
                  {d.name}
                </span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-green-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <h3 className="text-base font-black text-zinc-900 dark:text-white mb-2">
                {lang === 'bn' ? d.titleBn : d.titleEn}
              </h3>

              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {lang === 'bn' ? d.roleBn : d.roleEn}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/60 space-y-1 text-[11px] font-bold">
              <div className="flex justify-between text-zinc-500">
                <span>{t('resolution_col')}:</span>
                <span className="text-zinc-900 dark:text-white">{d.resolution}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t('citation_col')}:</span>
                <span className="text-zinc-700 dark:text-zinc-300 text-right">{d.citation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
