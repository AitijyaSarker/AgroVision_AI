import { FarmConditionReport } from '../nasa/normalizer';
import { assessFarmStress, FarmStressAssessment } from './stressEngine';
import { generateRotationScenarios, RotationAnalysisResult } from './rotationEngine';

export interface WhatIfParameters {
  rainfallDeltaPercent: number; // e.g. -30 to +40%
  tempDeltaCelsius: number; // e.g. -2 to +4°C
  soilMoistureDeltaPercent: number; // e.g. -30 to +30%
  irrigationOverride?: 'full' | 'partial' | 'rainfed' | 'none';
}

export interface WhatIfSimulationResult {
  simulatedConditions: FarmConditionReport;
  simulatedAssessment: FarmStressAssessment;
  simulatedRotation: RotationAnalysisResult;
  impactSummaryEn: string;
  impactSummaryBn: string;
}

/**
 * What-If Environmental Simulator
 * Stress-tests farm conditions under hypothetical rainfall, thermal, and irrigation shifts.
 */
export function runWhatIfSimulation(
  baseReport: FarmConditionReport,
  currentCrop: string,
  previousCrop: string,
  targetSeason: 'Kharif-1' | 'Kharif-2' | 'Rabi',
  soilType: string,
  baseIrrigation: string,
  priorities: string[],
  params: WhatIfParameters
): WhatIfSimulationResult {
  // Clone base report to simulate altered environmental state
  const simulated: FarmConditionReport = JSON.parse(JSON.stringify(baseReport));

  // Apply rainfall delta
  const rainMultiplier = 1 + params.rainfallDeltaPercent / 100;
  simulated.precipitation.recent7DaysMm = Number(
    Math.max(0, simulated.precipitation.recent7DaysMm * rainMultiplier).toFixed(1)
  );
  simulated.precipitation.recent30DaysMm = Number(
    Math.max(0, simulated.precipitation.recent30DaysMm * rainMultiplier).toFixed(1)
  );
  simulated.precipitation.departurePercentage = Number(
    (simulated.precipitation.departurePercentage + params.rainfallDeltaPercent).toFixed(1)
  );

  // Apply temperature delta
  simulated.weather.currentTemp = Number(
    (simulated.weather.currentTemp + params.tempDeltaCelsius).toFixed(1)
  );
  simulated.weather.tempMax = Number(
    (simulated.weather.tempMax + params.tempDeltaCelsius).toFixed(1)
  );
  simulated.weather.tempAnomaly = Number(
    (simulated.weather.tempAnomaly + params.tempDeltaCelsius).toFixed(1)
  );

  // Apply soil moisture delta
  const moistureMultiplier = 1 + params.soilMoistureDeltaPercent / 100;
  simulated.soilMoisture.surfaceWetness = Number(
    Math.min(1.0, Math.max(0.05, simulated.soilMoisture.surfaceWetness * moistureMultiplier)).toFixed(2)
  );
  simulated.soilMoisture.rootZoneWetness = Number(
    Math.min(1.0, Math.max(0.1, simulated.soilMoisture.rootZoneWetness * moistureMultiplier)).toFixed(2)
  );

  // Run deterministic stress engine on simulated parameters
  const simulatedAssessment = assessFarmStress(simulated);

  // Run rotation engine on simulated parameters
  const effectiveIrrigation = params.irrigationOverride || baseIrrigation;
  const simulatedRotation = generateRotationScenarios(
    currentCrop,
    previousCrop,
    targetSeason,
    soilType,
    effectiveIrrigation,
    priorities,
    simulatedAssessment,
    simulated
  );

  // Generate impact summary
  const impactPartsEn: string[] = [];
  const impactPartsBn: string[] = [];

  if (params.rainfallDeltaPercent < -15) {
    impactPartsEn.push(`A ${Math.abs(params.rainfallDeltaPercent)}% rainfall decrease elevates water stress, favoring drought-hardy legumes and oilseeds.`);
    impactPartsBn.push(`বৃষ্টিপাত ${Math.abs(params.rainfallDeltaPercent)}% কমলে পানির ঘাটতি বাড়ে এবং খরাসহনশীল ডাল ও তৈলবীজ বেশি উপযোগী হয়।`);
  } else if (params.rainfallDeltaPercent > 20) {
    impactPartsEn.push(`A ${params.rainfallDeltaPercent}% rainfall surge increases waterlogging risk, favoring flood-tolerant crops.`);
    impactPartsBn.push(`বৃষ্টিপাত ${params.rainfallDeltaPercent}% বাড়লে জলাবদ্ধতার ঝুঁকি তৈরি হয় এবং জলসহনশীল জাত বেশি অগ্রাধিকার পায়।`);
  }

  if (params.tempDeltaCelsius > 1.5) {
    impactPartsEn.push(`A +${params.tempDeltaCelsius}°C warming trend tightens thermal windows for sensitive cool-season tubers and cereals.`);
    impactPartsBn.push(`তাপমাত্রা +${params.tempDeltaCelsius}°C বৃদ্ধি পেলে শীতকালীন আলু ও গমের ফুল-ফল আসার সময় তাপীয় চাপ বাড়ে।`);
  }

  const impactSummaryEn = impactPartsEn.length ? impactPartsEn.join(' ') : 'Conditions remain close to current baseline observations.';
  const impactSummaryBn = impactPartsBn.length ? impactPartsBn.join(' ') : 'অনুকরণীয় অবস্থা বর্তমান স্যাটেলাইট পর্যবেক্ষণের কাছাকাছি রয়েছে।';

  return {
    simulatedConditions: simulated,
    simulatedAssessment,
    simulatedRotation,
    impactSummaryEn,
    impactSummaryBn,
  };
}
