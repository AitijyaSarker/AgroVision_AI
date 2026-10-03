import { NextRequest, NextResponse } from 'next/server';
import { getCachedOrFreshNASAData } from '@/lib/nasa/nasaCache';
import { assessFarmStress } from '@/lib/engine/stressEngine';
import { generateRotationScenarios } from '@/lib/engine/rotationEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      latitude = 24.8949,
      longitude = 91.8687,
      farmId,
      locationName = 'Farm Location',
      currentCrop = 'T. Aman Rice',
      previousCrop = 'Aus Rice',
      targetSeason = 'Rabi',
      soilType = 'alluvial',
      irrigation = 'partial',
      priorities = ['soil_health', 'climate_resilience'],
    } = body;

    // 1. Fetch normalized NASA observations
    const report = await getCachedOrFreshNASAData(
      Number(latitude),
      Number(longitude),
      farmId,
      locationName
    );

    // 2. Assess deterministic stress indicators
    const assessment = assessFarmStress(report);

    // 3. Generate candidate rotation scenarios
    const rotationResult = generateRotationScenarios(
      currentCrop,
      previousCrop,
      targetSeason,
      soilType,
      irrigation,
      priorities,
      assessment,
      report
    );

    return NextResponse.json({
      success: true,
      analysis: rotationResult,
      assessment,
      nasaObservations: {
        weather: report.weather,
        precipitation: report.precipitation,
        soilMoisture: report.soilMoisture,
        vegetation: report.vegetation,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to analyze crop rotation', details: err.message },
      { status: 500 }
    );
  }
}
