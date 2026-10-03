import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Farm } from '@/lib/models/Farm';
import { getCachedOrFreshNASAData } from '@/lib/nasa/nasaCache';
import { assessFarmStress } from '@/lib/engine/stressEngine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let lat = 24.8949;
  let lon = 91.8687;
  let locationName = 'Sylhet Farm';

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const farm = await Farm.findById(id);
      if (farm) {
        lat = farm.latitude;
        lon = farm.longitude;
        locationName = farm.locationName || farm.name;
      }
    }
  } catch (err: any) {
    console.warn('Farm lookup error for assessment:', err.message);
  }

  try {
    const report = await getCachedOrFreshNASAData(lat, lon, id, locationName);
    const assessment = assessFarmStress(report);
    assessment.farmId = id;

    return NextResponse.json({
      success: true,
      assessment,
      nasaReport: report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to compute farm assessment', details: err.message },
      { status: 500 }
    );
  }
}
