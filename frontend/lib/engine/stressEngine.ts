import { FarmConditionReport } from '../nasa/normalizer';

export interface StressIndicator {
  score: number; // 0 - 100
  level: 'low' | 'moderate' | 'high' | 'severe';
  titleEn: string;
  titleBn: string;
  statusEn: string;
  statusBn: string;
  reasonsEn: string[];
  reasonsBn: string[];
  nasaEvidence: {
    parameter: string;
    value: string;
    source: string;
  }[];
}

export interface FarmStressAssessment {
  farmId?: string;
  waterStress: StressIndicator;
  excessWaterRisk: StressIndicator;
  heatStress: StressIndicator;
  vegetationStress: StressIndicator;
  overallSignal: {
    key: 'optimal' | 'water_shortage' | 'excess_water' | 'heat_stress' | 'vegetation_decline';
    titleEn: string;
    titleBn: string;
    summaryEn: string;
    summaryBn: string;
    severity: 'normal' | 'caution' | 'warning' | 'critical';
  };
  currentVsNormal: {
    rainfallDeparture: number; // %
    tempAnomaly: number; // °C
    soilMoistureStatus: string;
    vegetationHealth: string;
  };
  assessedAt: string;
}

/**
 * Deterministic, rule-based Farm Stress Engine.
 * Never invents scores; computes transparent weighted indicators based strictly on NASA observations.
 */
export function assessFarmStress(report: FarmConditionReport): FarmStressAssessment {
  const { weather, precipitation, soilMoisture, vegetation } = report;

  // 1. Water Stress Indicator
  // Signals: Rainfall deficit, low surface wetness (GWETTOP < 0.40), root-zone drying, declining vegetation
  let waterScore = 15; // baseline calm
  const waterReasonsEn: string[] = [];
  const waterReasonsBn: string[] = [];

  if (precipitation.departurePercentage < -25) {
    waterScore += 30;
    waterReasonsEn.push(`30-day rainfall is ${Math.abs(precipitation.departurePercentage)}% below normal`);
    waterReasonsBn.push(`৩০ দিনের বৃষ্টিপাত স্বাভাবিকের চেয়ে ${Math.abs(precipitation.departurePercentage)}% কম`);
  } else if (precipitation.departurePercentage < -10) {
    waterScore += 15;
    waterReasonsEn.push(`Rainfall is mildly below normal (-${Math.abs(precipitation.departurePercentage)}%)`);
    waterReasonsBn.push(`বৃষ্টিপাত স্বাভাবিকের চেয়ে কিছুটা কম (-${Math.abs(precipitation.departurePercentage)}%)`);
  }

  if (soilMoisture.surfaceWetness < 0.35) {
    waterScore += 35;
    waterReasonsEn.push(`Surface soil wetness is low (${(soilMoisture.surfaceWetness * 100).toFixed(0)}%)`);
    waterReasonsBn.push(`মাটির উপরিভাগের আর্দ্রতা কম (${(soilMoisture.surfaceWetness * 100).toFixed(0)}%)`);
  } else if (soilMoisture.surfaceWetness < 0.48) {
    waterScore += 15;
    waterReasonsEn.push(`Surface soil moisture is in moderate lower range`);
    waterReasonsBn.push(`মাটির আর্দ্রতা মধ্যম থেকে নিম্ন পর্যায়ে রয়েছে`);
  }

  if (soilMoisture.trend === 'drying') {
    waterScore += 10;
    waterReasonsEn.push('Soil moisture trend shows progressive drying');
    waterReasonsBn.push('মাটির আর্দ্রতা ধীরে ধীরে শুকিয়ে যাওয়ার ধারা দেখাচ্ছে');
  }

  if (vegetation.thirtyDayTrend === 'declining') {
    waterScore += 10;
    waterReasonsEn.push('Vegetation greenness index (NDVI) shows downward trend');
    waterReasonsBn.push('ফসলের সবুজভাব সূচক (এনডিভিআই) নিম্নগামী রয়েছে');
  }

  waterScore = Math.min(100, Math.max(0, waterScore));
  let waterLevel: StressIndicator['level'] = 'low';
  if (waterScore >= 70) waterLevel = 'severe';
  else if (waterScore >= 45) waterLevel = 'high';
  else if (waterScore >= 25) waterLevel = 'moderate';

  const waterStress: StressIndicator = {
    score: waterScore,
    level: waterLevel,
    titleEn: 'Water Stress Signal',
    titleBn: 'পানির ঘাটতির সংকেত',
    statusEn: waterLevel === 'low' ? 'Normal / Adequate' : waterLevel === 'moderate' ? 'Mild Moisture Deficit' : 'High Water Stress Risk',
    statusBn: waterLevel === 'low' ? 'স্বাভাবিক / পর্যাপ্ত' : waterLevel === 'moderate' ? 'সামান্য পানির ঘাটতি' : 'উচ্চ পানির ঘাটতির ঝুঁকি',
    reasonsEn: waterReasonsEn.length ? waterReasonsEn : ['Sufficient rainfall and soil wetness detected in satellite observations'],
    reasonsBn: waterReasonsBn.length ? waterReasonsBn : ['স্যাটেলাইট পর্যবেক্ষণে পর্যাপ্ত বৃষ্টিপাত এবং মাটির আর্দ্রতা বিদ্যমান'],
    nasaEvidence: [
      { parameter: 'Recent 30D Rainfall', value: `${precipitation.recent30DaysMm} mm (${precipitation.departurePercentage}% departure)`, source: 'NASA GPM' },
      { parameter: 'Surface Wetness (GWETTOP)', value: `${(soilMoisture.surfaceWetness * 100).toFixed(0)}%`, source: 'NASA SMAP' },
      { parameter: 'Root Zone Wetness (GWETROOT)', value: `${(soilMoisture.rootZoneWetness * 100).toFixed(0)}%`, source: 'NASA SMAP' },
    ],
  };

  // 2. Excess Water & Waterlogging Risk
  // Signals: High 7-day rainfall (>80mm), saturated soil (>0.75), wet trend
  let excessScore = 10;
  const excessReasonsEn: string[] = [];
  const excessReasonsBn: string[] = [];

  if (precipitation.recent7DaysMm > 90) {
    excessScore += 45;
    excessReasonsEn.push(`Heavy 7-day cumulative rainfall of ${precipitation.recent7DaysMm} mm`);
    excessReasonsBn.push(`গত ৭ দিনে ${precipitation.recent7DaysMm} মিমি ভারী বৃষ্টিপাত হয়েছে`);
  } else if (precipitation.recent7DaysMm > 50) {
    excessScore += 25;
    excessReasonsEn.push(`Moderate-heavy 7-day rainfall (${precipitation.recent7DaysMm} mm)`);
    excessReasonsBn.push(`গত ৭ দিনে মাঝারি-ভারী বৃষ্টিপাত (${precipitation.recent7DaysMm} মিমি)`);
  }

  if (soilMoisture.surfaceWetness > 0.82) {
    excessScore += 35;
    excessReasonsEn.push(`Soil surface is saturated/waterlogged (${(soilMoisture.surfaceWetness * 100).toFixed(0)}%)`);
    excessReasonsBn.push(`মাটি স্যাঁতসেঁতে বা অতিরিক্ত পানি জমে আছে (${(soilMoisture.surfaceWetness * 100).toFixed(0)}%)`);
  } else if (soilMoisture.surfaceWetness > 0.70) {
    excessScore += 15;
    excessReasonsEn.push('Soil moisture is in upper saturation boundary');
    excessReasonsBn.push('মাটি উচ্চ আর্দ্রতা সীমায় রয়েছে');
  }

  excessScore = Math.min(100, Math.max(0, excessScore));
  let excessLevel: StressIndicator['level'] = 'low';
  if (excessScore >= 70) excessLevel = 'severe';
  else if (excessScore >= 45) excessLevel = 'high';
  else if (excessScore >= 25) excessLevel = 'moderate';

  const excessWaterRisk: StressIndicator = {
    score: excessScore,
    level: excessLevel,
    titleEn: 'Excess Water / Drainage Risk',
    titleBn: 'অতিরিক্ত পানি / জলাবদ্ধতার ঝুঁকি',
    statusEn: excessLevel === 'low' ? 'Good Drainage / Safe' : excessLevel === 'moderate' ? 'Moisture Elevated' : 'High Waterlogging Risk',
    statusBn: excessLevel === 'low' ? 'নিষ্কাশন স্বাভাবিক / নিরাপদ' : excessLevel === 'moderate' ? 'আর্দ্রতা কিছুটা বেশি' : 'উচ্চ জলাবদ্ধতার ঝুঁকি',
    reasonsEn: excessReasonsEn.length ? excessReasonsEn : ['No excessive precipitation or water accumulation detected'],
    reasonsBn: excessReasonsBn.length ? excessReasonsBn : ['কোন অতিরিক্ত বৃষ্টি বা পানি জমে থাকার সংকেত নেই'],
    nasaEvidence: [
      { parameter: '7-Day Precipitation', value: `${precipitation.recent7DaysMm} mm`, source: 'NASA GPM' },
      { parameter: 'Surface Wetness', value: `${(soilMoisture.surfaceWetness * 100).toFixed(0)}%`, source: 'NASA SMAP' },
    ],
  };

  // 3. Heat Stress Indicator
  // Signals: Max daily temp > 34°C, temp anomaly > +1.5°C, high humidity heat index
  let heatScore = 10;
  const heatReasonsEn: string[] = [];
  const heatReasonsBn: string[] = [];

  if (weather.tempMax >= 36) {
    heatScore += 45;
    heatReasonsEn.push(`Maximum daily temperature reached extreme ${weather.tempMax}°C`);
    heatReasonsBn.push(`সর্বোচ্চ দৈনিক তাপমাত্রা তীব্র ${weather.tempMax}°C-এ পৌঁছেছে`);
  } else if (weather.tempMax >= 33) {
    heatScore += 25;
    heatReasonsEn.push(`High daytime temperature of ${weather.tempMax}°C`);
    heatReasonsBn.push(`দিনের সর্বোচ্চ তাপমাত্রা ${weather.tempMax}°C`);
  }

  if (weather.tempAnomaly >= 2.0) {
    heatScore += 25;
    heatReasonsEn.push(`Temperature is +${weather.tempAnomaly}°C above climatological normal`);
    heatReasonsBn.push(`তাপমাত্রা স্বাভাবিকের চেয়ে +${weather.tempAnomaly}°C বেশি`);
  } else if (weather.tempAnomaly >= 1.0) {
    heatScore += 15;
    heatReasonsEn.push(`Mild positive temperature anomaly (+${weather.tempAnomaly}°C)`);
    heatReasonsBn.push(`তাপমাত্রা স্বাভাবিকের চেয়ে সামান্য বেশি (+${weather.tempAnomaly}°C)`);
  }

  heatScore = Math.min(100, Math.max(0, heatScore));
  let heatLevel: StressIndicator['level'] = 'low';
  if (heatScore >= 65) heatLevel = 'severe';
  else if (heatScore >= 40) heatLevel = 'high';
  else if (heatScore >= 20) heatLevel = 'moderate';

  const heatStress: StressIndicator = {
    score: heatScore,
    level: heatLevel,
    titleEn: 'Thermal / Heat Stress',
    titleBn: 'তাপমাত্রা ও তাপপ্রবাহের চাপ',
    statusEn: heatLevel === 'low' ? 'Favorable Temperature' : heatLevel === 'moderate' ? 'Elevated Warmth' : 'Crop Heat Stress Alert',
    statusBn: heatLevel === 'low' ? 'অনুকূল তাপমাত্রা' : heatLevel === 'moderate' ? 'উষ্ণতা কিছুটা বেশি' : 'ফসলে তাপজনিত চাপের সতর্কতা',
    reasonsEn: heatReasonsEn.length ? heatReasonsEn : ['Temperatures are within comfortable agronomic ranges for regional crops'],
    reasonsBn: heatReasonsBn.length ? heatReasonsBn : ['আঞ্চলিক ফসলের জন্য তাপমাত্রা স্বাভাবিক ও উপযোগী সীমার মধ্যে রয়েছে'],
    nasaEvidence: [
      { parameter: 'Max Temperature', value: `${weather.tempMax} °C`, source: 'NASA POWER' },
      { parameter: 'Climatological Anomaly', value: `${weather.tempAnomaly > 0 ? '+' : ''}${weather.tempAnomaly} °C`, source: 'NASA POWER Climatology' },
    ],
  };

  // 4. Vegetation Stress Indicator
  let vegScore = 15;
  const vegReasonsEn: string[] = [];
  const vegReasonsBn: string[] = [];

  if (vegetation.ndviValue < 0.40) {
    vegScore += 45;
    vegReasonsEn.push(`Low vegetation vigor (NDVI ${vegetation.ndviValue.toFixed(2)})`);
    vegReasonsBn.push(`ফসলের সবুজভাব কম (এনডিভিআই ${vegetation.ndviValue.toFixed(2)})`);
  } else if (vegetation.ndviValue < 0.52) {
    vegScore += 20;
    vegReasonsEn.push(`Moderate canopy greenness (NDVI ${vegetation.ndviValue.toFixed(2)})`);
    vegReasonsBn.push(`ফসলের মাঝারি সবুজভাব (এনডিভিআই ${vegetation.ndviValue.toFixed(2)})`);
  }

  if (vegetation.thirtyDayTrend === 'declining') {
    vegScore += 25;
    vegReasonsEn.push('Vegetation greenness has shown a 30-day downward slope');
    vegReasonsBn.push('গত ৩০ দিনে ফসলের সবুজভাব সূচক হ্রাস পেয়েছে');
  }

  vegScore = Math.min(100, Math.max(0, vegScore));
  let vegLevel: StressIndicator['level'] = 'low';
  if (vegScore >= 65) vegLevel = 'severe';
  else if (vegScore >= 40) vegLevel = 'high';
  else if (vegScore >= 20) vegLevel = 'moderate';

  const vegetationStress: StressIndicator = {
    score: vegScore,
    level: vegLevel,
    titleEn: 'Vegetation Condition',
    titleBn: 'ফসলের সবুজভাব অবস্থা',
    statusEn: vegLevel === 'low' ? 'Healthy Canopy Greenness' : vegLevel === 'moderate' ? 'Fair / Stable Vigor' : 'Canopy Stress Detected',
    statusBn: vegLevel === 'low' ? 'সুস্থ সবুজ পাতার আচ্ছাদন' : vegLevel === 'moderate' ? 'স্থিতিশীল বৃদ্ধি' : 'উদ্ভিদের বৃদ্ধির টান সনাক্ত',
    reasonsEn: vegReasonsEn.length ? vegReasonsEn : ['Satellite vegetation index indicates normal, healthy crop development'],
    reasonsBn: vegReasonsBn.length ? vegReasonsBn : ['স্যাটেলাইট সূচকে স্বাভাবিক ও সুস্থ ফসলের বৃদ্ধি নির্দেশ করছে'],
    nasaEvidence: [
      { parameter: 'Current NDVI', value: vegetation.ndviValue.toFixed(2), source: 'NASA HLS' },
      { parameter: '30-Day Trend', value: vegetation.thirtyDayTrend, source: 'NASA HLS' },
    ],
  };

  // Determine overall dominant signal
  let overallKey: FarmStressAssessment['overallSignal']['key'] = 'optimal';
  let overallSeverity: FarmStressAssessment['overallSignal']['severity'] = 'normal';
  let titleEn = 'Balanced Growing Conditions';
  let titleBn = 'অনুকূল ও ভারসাম্যপূর্ণ পরিবেশ';
  let summaryEn = 'NASA observations indicate balanced moisture, temperature, and vegetation health across your farm area.';
  let summaryBn = 'নাসা স্যাটেলাইট পর্যবেক্ষণে আপনার খামার এলাকায় স্বাভাবিক আর্দ্রতা, তাপমাত্রা এবং ফসলের সুস্থ বিকাশ দেখা যাচ্ছে।';

  if (waterScore >= 50) {
    overallKey = 'water_shortage';
    overallSeverity = waterScore >= 70 ? 'critical' : 'warning';
    titleEn = 'Possible Water Deficit Signal';
    titleBn = 'পানির ঘাটতির সম্ভাব্য সংকেত';
    summaryEn = 'Recent satellite data shows rainfall deficit and reduced soil wetness. Consider crops with lower water requirements.';
    summaryBn = 'সাম্প্রতিক স্যাটেলাইট তথ্যে বৃষ্টিপাতের ঘাটতি এবং মাটির আর্দ্রতা কমে যাওয়া দেখা যাচ্ছে। কম পানির চাহিদার ফসল বিবেচনা করুন।';
  } else if (excessScore >= 50) {
    overallKey = 'excess_water';
    overallSeverity = excessScore >= 70 ? 'critical' : 'warning';
    titleEn = 'Excess Moisture / Drainage Warning';
    titleBn = 'অতিরিক্ত আর্দ্রতা ও পানি নিষ্কাশনের সতর্কতা';
    summaryEn = 'Elevated rainfall and high soil saturation detected. Ensure field drainage or prioritize waterlogging-tolerant crops.';
    summaryBn = 'ভারী বৃষ্টি এবং মাটিতে উচ্চ আর্দ্রতা সনাক্ত হয়েছে। জমির পানি নিষ্কাশন নিশ্চিত করুন অথবা জলসহনশীল জাত নির্বাচন করুন।';
  } else if (heatScore >= 50) {
    overallKey = 'heat_stress';
    overallSeverity = 'warning';
    titleEn = 'Elevated Thermal Stress';
    titleBn = 'উচ্চ তাপমাত্রাজনিত সংকেত';
    summaryEn = 'Daytime temperatures are running above climatological normal. Pay attention to heat-sensitive flowering crops.';
    summaryBn = 'দিনের তাপমাত্রা স্বাভাবিকের চেয়ে বেশি। ফুল ও ফল ধরার সময় অতিরিক্ত তাপে সংবেদনশীল ফসলের দিকে খেয়াল রাখুন।';
  } else if (vegScore >= 50) {
    overallKey = 'vegetation_decline';
    overallSeverity = 'caution';
    titleEn = 'Vegetation Slowdown Signal';
    titleBn = 'ফসলের বৃদ্ধির হার কমার সংকেত';
    summaryEn = 'Vegetation greenness trend has weakened. Examine nutrient access, pest status, or localized soil factors.';
    summaryBn = 'ফসলের সবুজভাব বৃদ্ধির গতি কিছুটা কমেছে। মাটির পুষ্টি, কীট বা সেচের অবস্থা পর্যবেক্ষণ করুন।';
  }

  return {
    waterStress,
    excessWaterRisk,
    heatStress,
    vegetationStress,
    overallSignal: {
      key: overallKey,
      titleEn,
      titleBn,
      summaryEn,
      summaryBn,
      severity: overallSeverity,
    },
    currentVsNormal: {
      rainfallDeparture: precipitation.departurePercentage,
      tempAnomaly: weather.tempAnomaly,
      soilMoistureStatus: soilMoisture.status,
      vegetationHealth: vegetation.vegetationCondition,
    },
    assessedAt: new Date().toISOString(),
  };
}
