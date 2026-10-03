import { CropProfile, BANGLADESH_CROPS, getCropsForSeason } from './cropLibrary';
import { FarmStressAssessment } from './stressEngine';
import { FarmConditionReport } from '../nasa/normalizer';

export interface RotationScenario {
  id: string;
  scenarioType: 'resilient' | 'low_water' | 'soil_health' | 'economic';
  titleEn: string;
  titleBn: string;
  nextCrop: CropProfile;
  cropSequenceTextEn: string;
  cropSequenceTextBn: string;
  suitabilityScore: number; // 0 - 100
  waterFit: 'optimal' | 'moderate' | 'high_risk';
  waterFitTextEn: string;
  waterFitTextBn: string;
  soilHealthImpact: 'improving' | 'neutral' | 'depleting';
  soilHealthTextEn: string;
  soilHealthTextBn: string;
  climateResilience: 'high' | 'moderate' | 'low';
  costLevel: 'low' | 'medium' | 'high';
  yieldExpectation: 'medium' | 'high' | 'very_high';
  priorityScore: number; // 0 - 100
  whyThisPlan: {
    nasaFactorEn: string;
    nasaFactorBn: string;
    soilFactorEn: string;
    soilFactorBn: string;
    priorityFactorEn: string;
    priorityFactorBn: string;
    rotationBenefitEn: string;
    rotationBenefitBn: string;
  };
  tradeoffs: {
    prosEn: string[];
    prosBn: string[];
    risksEn: string[];
    risksBn: string[];
  };
  assumptions: {
    en: string;
    bn: string;
  };
}

export interface RotationAnalysisResult {
  currentCrop: string;
  previousCrop: string;
  targetSeason: 'Kharif-1' | 'Kharif-2' | 'Rabi';
  soilType: string;
  irrigation: string;
  priorities: string[];
  scenarios: RotationScenario[];
  summaryEn: string;
  summaryBn: string;
  generatedAt: string;
}

/**
 * Deterministic Next-Season Crop Rotation Engine.
 * Combines NASA observations, agronomic characteristics, soil profiles, and farmer priorities
 * into transparent, comparative scenarios.
 */
export function generateRotationScenarios(
  currentCropName: string,
  previousCropName: string,
  targetSeason: 'Kharif-1' | 'Kharif-2' | 'Rabi',
  soilType: string = 'alluvial',
  irrigation: string = 'partial',
  priorities: string[] = ['soil_health', 'climate_resilience'],
  stressAssessment: FarmStressAssessment,
  nasaReport: FarmConditionReport
): RotationAnalysisResult {
  // Candidate pool for target season
  const candidates = getCropsForSeason(targetSeason);
  const { waterStress, excessWaterRisk, heatStress } = stressAssessment;

  // Score each candidate crop deterministically
  const scored = candidates.map((crop) => {
    let score = 60; // base score

    // 1. Water Match (NASA GPM + SMAP)
    let waterFit: RotationScenario['waterFit'] = 'optimal';
    if (waterStress.level === 'severe' || waterStress.level === 'high') {
      if (crop.waterNeed === 'very_low' || crop.waterNeed === 'low') {
        score += 25;
        waterFit = 'optimal';
      } else if (crop.waterNeed === 'very_high' || crop.waterNeed === 'high') {
        score -= (irrigation === 'full' ? 10 : 35);
        waterFit = irrigation === 'full' ? 'moderate' : 'high_risk';
      }
    } else if (excessWaterRisk.level === 'high' || excessWaterRisk.level === 'severe') {
      if (crop.waterloggingTolerance === 'high') {
        score += 20;
        waterFit = 'optimal';
      } else if (crop.waterloggingTolerance === 'low') {
        score -= 25;
        waterFit = 'high_risk';
      }
    }

    // 2. Heat Match (NASA POWER)
    if (heatStress.level === 'high' || heatStress.level === 'severe') {
      if (crop.tempSuitability.max < nasaReport.weather.tempMax) {
        score -= 15;
      } else {
        score += 10;
      }
    }

    // 3. Soil Suitability
    if (soilType !== 'unknown' && crop.soilPreferences.includes(soilType)) {
      score += 15;
    }

    // 4. Rotation Compatibility (Avoid continuous monoculture)
    const normalizedCurrent = currentCropName.toLowerCase();
    if (normalizedCurrent.includes(crop.id) || normalizedCurrent.includes(crop.nameEn.toLowerCase())) {
      score -= 20; // Penalize repeating the exact same crop
    } else {
      score += 10;
    }

    // 5. Farmer Priority Alignment
    let priorityMatches = 0;
    if (priorities.includes('soil_health') && crop.soilHealthBenefit === 'high') {
      score += 20;
      priorityMatches++;
    }
    if (priorities.includes('lower_water') && (crop.waterNeed === 'low' || crop.waterNeed === 'very_low')) {
      score += 20;
      priorityMatches++;
    }
    if (priorities.includes('lower_cost') && crop.economicCost === 'low') {
      score += 15;
      priorityMatches++;
    }
    if (priorities.includes('climate_resilience') && crop.droughtTolerance === 'high') {
      score += 15;
      priorityMatches++;
    }
    if (priorities.includes('yield_potential') && (crop.yieldPotential === 'very_high' || crop.yieldPotential === 'high')) {
      score += 15;
      priorityMatches++;
    }

    const priorityScore = Math.min(100, Math.round(50 + priorityMatches * 15));
    const finalScore = Math.min(98, Math.max(30, score));

    return {
      crop,
      score: finalScore,
      waterFit,
      priorityScore,
    };
  });

  // Sort by suitability score descending
  scored.sort((a, b) => b.score - a.score);

  // Build 4 specialized scenarios:
  // 1. Resilient Scenario (Top overall score)
  // 2. Low-Water Scenario (Lowest water requirement)
  // 3. Soil Health Scenario (Legume or high biological benefit)
  // 4. Economic / Yield Scenario (High yield potential)

  const resilientCandidate = scored[0] || scored[0];
  const lowWaterCandidate =
    scored.find((s) => s.crop.waterNeed === 'very_low' || s.crop.waterNeed === 'low') || scored[1] || scored[0];
  const soilHealthCandidate =
    scored.find((s) => s.crop.soilHealthBenefit === 'high' && s.crop.id !== resilientCandidate.crop.id) ||
    scored.find((s) => s.crop.soilHealthBenefit === 'high') ||
    scored[1] ||
    scored[0];
  const economicCandidate =
    scored.find(
      (s) =>
        (s.crop.yieldPotential === 'very_high' || s.crop.yieldPotential === 'high') &&
        s.crop.id !== resilientCandidate.crop.id &&
        s.crop.id !== lowWaterCandidate.crop.id
    ) || scored[2] || scored[1] || scored[0];

  const buildScenario = (
    candidate: (typeof scored)[0],
    scenarioType: RotationScenario['scenarioType'],
    titleEn: string,
    titleBn: string
  ): RotationScenario => {
    const { crop, score, waterFit, priorityScore } = candidate;

    let waterFitTextEn = 'Well aligned with expected seasonal moisture';
    let waterFitTextBn = 'প্রত্যাশিত মৌসুমী আর্দ্রতার সাথে চমৎকার সামঞ্জস্যপূর্ণ';
    if (waterFit === 'moderate') {
      waterFitTextEn = 'Requires careful monitoring or supplemental irrigation';
      waterFitTextBn = 'নিয়মিত পর্যবেক্ষণ বা সম্পূরক সেচের প্রয়োজন হতে পারে';
    } else if (waterFit === 'high_risk') {
      waterFitTextEn = 'High water demand under current dry satellite signals';
      waterFitTextBn = 'স্যাটেলাইটের শুষ্ক সংকেতের বিপরীতে পানির চাহিদা অত্যন্ত বেশি';
    }

    let soilHealthTextEn = 'Maintains current soil structure';
    let soilHealthTextBn = 'মাটির বর্তমান গঠন বজায় রাখে';
    if (crop.soilHealthBenefit === 'high') {
      soilHealthTextEn = 'Enhances organic nitrogen & soil biological vitality';
      soilHealthTextBn = 'জৈব নাইট্রোজেন এবং মাটির অণুজীব বৃদ্ধি করে';
    } else if (crop.soilHealthBenefit === 'depleting') {
      soilHealthTextEn = 'Heavy nutrient feeder; requires balanced replenishment';
      soilHealthTextBn = 'বেশি পুষ্টি গ্রহণকারী ফসল; সুষম সার প্রয়োগ প্রয়োজন';
    }

    return {
      id: `scenario_${scenarioType}_${crop.id}`,
      scenarioType,
      titleEn,
      titleBn,
      nextCrop: crop,
      cropSequenceTextEn: `${currentCropName} → ${crop.nameEn}`,
      cropSequenceTextBn: `${currentCropName} → ${crop.nameBn}`,
      suitabilityScore: score,
      waterFit,
      waterFitTextEn,
      waterFitTextBn,
      soilHealthImpact: crop.soilHealthBenefit === 'high' ? 'improving' : crop.soilHealthBenefit === 'depleting' ? 'depleting' : 'neutral',
      soilHealthTextEn,
      soilHealthTextBn,
      climateResilience: crop.droughtTolerance === 'high' ? 'high' : crop.droughtTolerance === 'medium' ? 'moderate' : 'low',
      costLevel: crop.economicCost,
      yieldExpectation: crop.yieldPotential,
      priorityScore,
      whyThisPlan: {
        nasaFactorEn: `NASA GPM/SMAP data indicates ${
          waterStress.level === 'low'
            ? 'stable water availability'
            : 'moisture constraints'
        } suitable for ${crop.waterNeed} water consumption crops.`,
        nasaFactorBn: `নাসা জিপিএম/এসএমএপি তথ্য নির্দেশ করে যে বর্তমান আর্দ্রতা ${crop.nameBn}-এর ${
          crop.waterNeed === 'low' || crop.waterNeed === 'very_low' ? 'স্বল্প' : 'মাঝারি'
        } পানির চাহিদার সাথে সামঞ্জস্যপূর্ণ।`,
        soilFactorEn: `Soil type (${soilType}) matches root aeration requirements of ${crop.nameEn}.`,
        soilFactorBn: `মাটির ধরন (${soilType}) ${crop.nameBn}-এর শিকড়ের বিস্তারের জন্য উপযোগী।`,
        priorityFactorEn: `Directly advances farmer priorities: ${priorities.map((p) => p.replace('_', ' ')).join(', ')}.`,
        priorityFactorBn: `কৃষকের অগ্রাধিকার (${priorities.join(', ')}) পূরণ করে।`,
        rotationBenefitEn: `Rotating after ${currentCropName} disrupts pest vectors and replenishes soil strata.`,
        rotationBenefitBn: `${currentCropName}-এর পর এই ফসল চাষ করলে পোকা-মাকড়ের আক্রমণ কমে এবং মাটির বিভিন্ন স্তরের ভারসাম্য ফিরে আসে।`,
      },
      tradeoffs: {
        prosEn: [
          crop.soilHealthBenefit === 'high' ? 'Fixes atmospheric nitrogen for the next season' : 'High economic yield potential',
          crop.waterNeed === 'low' || crop.waterNeed === 'very_low' ? 'Conserves groundwater and lowers fuel/pumping costs' : 'Proven staple with strong market liquidity',
          'Good climatic match for regional historical temperatures',
        ],
        prosBn: [
          crop.soilHealthBenefit === 'high' ? 'পরবর্তী মৌসুমের জন্য মাটিতে প্রাকৃতিক নাইট্রোজেন যোগ করে' : 'উচ্চ অর্থনৈতিক উৎপাদনের সম্ভাবনা',
          crop.waterNeed === 'low' || crop.waterNeed === 'very_low' ? 'ভূগর্ভস্থ পানি সাশ্রয় করে এবং সেচের খরচ কমায়' : 'বাজারে সহজ বিক্রয়যোগ্যতা',
          'আঞ্চলিক ঐতিহাসিক তাপমাত্রার সাথে মানানসই',
        ],
        risksEn: [
          crop.waterloggingTolerance === 'low' ? 'Requires good field drainage during sudden heavy showers' : 'Sensitive to market price volatility at harvest time',
          'Requires timely field preparation right after preceding harvest',
        ],
        risksBn: [
          crop.waterloggingTolerance === 'low' ? 'হঠাৎ ভারী বৃষ্টি হলে দ্রুত পানি নিষ্কাশনের ব্যবস্থা রাখতে হবে' : 'ফসল কাটার মৌসুমে বাজারদরের ওঠানামা থাকতে পারে',
          'আগের ফসল তোলার পর সময়মতো জমি প্রস্তুত করা প্রয়োজন',
        ],
      },
      assumptions: {
        en: 'Assumes average regional onset of seasonal monsoon/winter cooling and certified seed germination.',
        bn: 'মৌসুমী জলবায়ুর স্বাভাবিক আগমন এবং প্রত্যয়িত ভালো মানের বীজের অঙ্কুরোদগম ধরে নেওয়া হয়েছে।',
      },
    };
  };

  const scenarios: RotationScenario[] = [
    buildScenario(resilientCandidate, 'resilient', 'Scenario A: Climate-Adaptive Rotation', 'পরিকল্পনা ক: জলবায়ু-সহনশীল পরিবর্তন'),
    buildScenario(lowWaterCandidate, 'low_water', 'Scenario B: Low-Water Alternative', 'পরিকল্পনা খ: পানি-সাশ্রয়ী বিকল্প'),
    buildScenario(soilHealthCandidate, 'soil_health', 'Scenario C: Soil Nutrient Restoration', 'পরিকল্পনা গ: মাটির উর্বরতা পুনরুদ্ধার'),
    buildScenario(economicCandidate, 'economic', 'Scenario D: Yield & Economic Value', 'পরিকল্পনা ঘ: উচ্চ ফলন ও অর্থনৈতিক পরিকল্পনা'),
  ];

  return {
    currentCrop: currentCropName,
    previousCrop: previousCropName,
    targetSeason,
    soilType,
    irrigation,
    priorities,
    scenarios,
    summaryEn: `Generated ${scenarios.length} adaptive crop scenarios for ${targetSeason} based on NASA satellite observations and your farm priorities.`,
    summaryBn: `নাসা স্যাটেলাইট পর্যবেক্ষণ ও আপনার খামারের অগ্রাধিকারের ভিত্তিতে ${targetSeason} মৌসুমের জন্য ৪টি বিকল্প ফসলের পরিকল্পনা তৈরি করা হয়েছে।`,
    generatedAt: new Date().toISOString(),
  };
}
