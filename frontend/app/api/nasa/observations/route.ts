import { NextRequest, NextResponse } from 'next/server';
import { getCachedOrFreshNASAData } from '@/lib/nasa/nasaCache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get('lat') || searchParams.get('latitude');
  const lonStr = searchParams.get('lon') || searchParams.get('longitude');
  const farmId = searchParams.get('farmId') || undefined;
  const locationName = searchParams.get('locationName') || 'Bangladesh Farm';

  if (!latStr || !lonStr) {
    // Default to Sylhet, Bangladesh coordinates if not specified
    const defaultLat = 24.8949;
    const defaultLon = 91.8687;
    const report = await getCachedOrFreshNASAData(
      defaultLat,
      defaultLon,
      farmId,
      locationName
    );
    return NextResponse.json({ success: true, report });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude numbers' },
      { status: 400 }
    );
  }

  try {
    const report = await getCachedOrFreshNASAData(lat, lon, farmId, locationName);
    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve NASA observations', details: err.message },
      { status: 500 }
    );
  }
}
