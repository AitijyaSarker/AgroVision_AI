import { NextRequest, NextResponse } from 'next/server';
import { getCachedOrFreshNASAData } from '@/lib/nasa/nasaCache';
import { runWhatIfSimulation } from '@/lib/engine/whatIfSimulator';

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
      whatIfParams = {
        rainfallDeltaPercent: 0,
        tempDeltaCelsius: 0,
        soilMoistureDeltaPercent: 0,
      },
    } = body;

    // 1. Fetch baseline NASA observations
    const baseReport = await getCachedOrFreshNASAData(
      Number(latitude),
      Number(longitude),
      farmId,
      locationName
    );

    // 2. Run What-If simulation
    const simulation = runWhatIfSimulation(
      baseReport,
      currentCrop,
      previousCrop,
      targetSeason,
      soilType,
      irrigation,
      priorities,
      whatIfParams
    );

    return NextResponse.json({
      success: true,
      simulation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to run what-if simulation', details: err.message },
      { status: 500 }
    );
  }
}
