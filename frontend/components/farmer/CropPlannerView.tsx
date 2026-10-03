'use client'

import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Droplets,
  Leaf,
  Shield,
  DollarSign,
  TrendingUp,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  Info,
} from 'lucide-react';

import { Language } from '../../types';
import { translations } from '../../translations';
import { RotationAnalysisResult, RotationScenario } from '../../lib/engine/rotationEngine';
import { FarmConditionReport } from '../../lib/nasa/normalizer';

interface CropPlannerViewProps {
  lang: Language;
  analysis: RotationAnalysisResult | null;
  report: FarmConditionReport | null;
  onSelectScenario?: (scenario: RotationScenario) => void;
  isLoading?: boolean;
}

export const CropPlannerView: React.FC<CropPlannerViewProps> = ({
  lang,
  analysis,
  report,
  onSelectScenario,
  isLoading = false,
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

  if (isLoading || !analysis) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-zinc-200 dark:border-zinc-700 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          {lang === 'bn' ? 'ফসল আবর্তনের পরিকল্পনা তৈরি হচ্ছে...' : 'Generating adaptive crop rotation scenarios...'}
        </h3>
        <p className="text-zinc-500 text-sm mt-2">
          {lang === 'bn' ? 'নাসা পর্যবেক্ষণ ও আপনার অগ্রাধিকারের সমন্বয় করা হচ্ছে' : 'Aligning NASA observations with Bangladesh agronomic library'}
        </p>
      </div>
    );
  }

  const { scenarios, targetSeason, currentCrop, summaryEn, summaryBn } = analysis;

  const toggleWhy = (id: string) => {
    setExpandedWhyId(expandedWhyId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <RotateCcw className="w-7 h-7 text-green-700 dark:text-green-400" />
            {t('planner_title')}
          </h2>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
            {lang === 'bn' ? summaryBn : summaryEn}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-4 py-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl text-xs font-black text-green-800 dark:text-green-200 shadow-sm">
          <span>{t('target_season_label')}: {targetSeason}</span>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenarioId === scenario.id;
          const isWhyOpen = expandedWhyId === scenario.id;

          // Water Fit badge style
          const waterBadgeStyle = {
            optimal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
            moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
            high_risk: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
          }[scenario.waterFit];

          // Soil Health badge style
          const soilBadgeStyle = {
            improving: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300',
            neutral: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
            depleting: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
          }[scenario.soilHealthImpact];

          return (
            <div
              key={scenario.id}
              className={`bg-white dark:bg-zinc-800 rounded-3xl p-6 md:p-7 border transition-all shadow-lg flex flex-col justify-between ${
                isSelected
                  ? 'border-green-600 dark:border-green-500 ring-2 ring-green-600/30 shadow-xl'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div>
                {/* Scenario Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                      {lang === 'bn' ? scenario.titleBn.split(':')[0] : scenario.titleEn.split(':')[0]}
                    </span>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
                      {lang === 'bn' ? scenario.nextCrop.nameBn : scenario.nextCrop.nameEn}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-green-700 dark:text-green-400">
                      {scenario.suitabilityScore}%
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {t('scenario_suitability')}
                    </span>
                  </div>
                </div>

                {/* Crop Sequence Flow */}
                <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl mb-5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span className="opacity-75">{currentCrop}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-green-700 dark:text-green-400 font-black">
                    {lang === 'bn' ? scenario.nextCrop.nameBn : scenario.nextCrop.nameEn}
                  </span>
                  <span className="ml-auto text-zinc-400">({scenario.nextCrop.durationDays})</span>
                </div>

                {/* Core Attributes */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-zinc-400 font-bold block mb-1">{t('scenario_water_fit')}</span>
                    <span className={`px-2 py-0.5 rounded-md font-black inline-block text-[11px] ${waterBadgeStyle}`}>
                      {scenario.nextCrop.waterNeed.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-zinc-400 font-bold block mb-1">{t('scenario_soil_impact')}</span>
                    <span className={`px-2 py-0.5 rounded-md font-black inline-block text-[11px] ${soilBadgeStyle}`}>
                      {scenario.soilHealthImpact.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Priority Match Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    <span>{t('priority_alignment')}</span>
                    <span className="font-black text-zinc-900 dark:text-white">{scenario.priorityScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${scenario.priorityScore}%` }}
                    />
                  </div>
                </div>

                {/* Expandable Why This Plan Section */}
                <div className="border-t border-zinc-100 dark:border-zinc-700/60 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleWhy(scenario.id)}
                    className="w-full flex items-center justify-between text-left text-xs font-black text-green-700 dark:text-green-400 hover:opacity-80 transition-opacity"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      {t('why_this_plan_title')}
                    </span>
                    {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isWhyOpen && (
                    <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl space-y-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 animate-in slide-in-from-top-1">
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-0.5">
                          {lang === 'bn' ? 'নাসা পর্যবেক্ষণ প্রমাণ' : 'NASA Satellite Evidence'}
                        </span>
                        <p>{lang === 'bn' ? scenario.whyThisPlan.nasaFactorBn : scenario.whyThisPlan.nasaFactorEn}</p>
                      </div>

                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-0.5">
                          {lang === 'bn' ? 'মাটি ও আবহাওয়া মিল' : 'Soil & Climate Fit'}
                        </span>
                        <p>{lang === 'bn' ? scenario.whyThisPlan.soilFactorBn : scenario.whyThisPlan.soilFactorEn}</p>
                      </div>

                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-0.5">
                          {lang === 'bn' ? 'ফসল আবর্তনের সুবিধা' : 'Rotation Benefit'}
                        </span>
                        <p>{lang === 'bn' ? scenario.whyThisPlan.rotationBenefitBn : scenario.whyThisPlan.rotationBenefitEn}</p>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-1">
                          {t('advantages_label')}
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-emerald-800 dark:text-emerald-300">
                          {(lang === 'bn' ? scenario.tradeoffs.prosBn : scenario.tradeoffs.prosEn).map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-1">
                          {t('risks_label')}
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-amber-800 dark:text-amber-300">
                          {(lang === 'bn' ? scenario.tradeoffs.risksBn : scenario.tradeoffs.risksEn).map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-5 mt-4 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400">
                  {lang === 'bn' ? scenario.titleBn : scenario.titleEn}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedScenarioId(scenario.id);
                    if (onSelectScenario) onSelectScenario(scenario);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-green-700 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {isSelected ? (lang === 'bn' ? 'নির্বাচিত' : 'Selected') : (lang === 'bn' ? 'পরিকল্পনা পছন্দ করুন' : 'Select Plan')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assumptions Footer Notice */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-500 flex items-center gap-3">
        <Info className="w-4 h-4 flex-shrink-0 text-zinc-400" />
        <span>
          {lang === 'bn'
            ? 'সুপারিশসমূহ আঞ্চলিক নাসা উপগ্রহ ডেটা, ঐতিহাসিক জলবায়ু মান এবং ফসল আবর্তন নিয়মের ওপর ভিত্তি করে তৈরি। স্থানীয় আবহাওয়ার বিশেষ পরিবর্তনের জন্য সতর্ক থাকুন।'
            : 'Recommendations reflect regional NASA Earth observation averages and rotation heuristics. Always monitor micro-climate variations.'}
        </span>
      </div>
    </div>
  );
};
