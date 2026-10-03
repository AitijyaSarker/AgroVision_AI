import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Farm } from '@/lib/models/Farm';

// Fallback demo farm for guests or when DB is offline
const DEMO_FARM = {
  _id: 'demo_farm_sylhet',
  userId: 'guest_user',
  name: 'Sylhet Green Valley Farm',
  locationName: 'Sylhet Sadar, Bangladesh',
  latitude: 24.8949,
  longitude: 91.8687,
  boundary: [
    [24.896, 91.867],
    [24.896, 91.871],
    [24.893, 91.871],
    [24.893, 91.867],
  ],
  area: 66,
  areaUnit: 'decimal', // 2 bighas
  currentCrop: 'T. Aman Rice',
  previousCrop: 'Aus Rice',
  season: 'Rabi',
  soilType: 'alluvial',
  irrigation: 'partial',
  waterSource: 'groundwater',
  priorities: ['soil_health', 'climate_resilience', 'lower_water'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'guest_user';

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const farms = await Farm.find({ userId }).sort({ createdAt: -1 });
      if (farms && farms.length > 0) {
        return NextResponse.json({ success: true, farms });
      }
    }
  } catch (err: any) {
    console.warn('Farms query error, using demo fallback:', err.message);
  }

  // Return demo farm if database is empty or disconnected
  return NextResponse.json({
    success: true,
    farms: [DEMO_FARM],
    isDemo: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      locationName,
      latitude,
      longitude,
      boundary,
      area,
      areaUnit,
      currentCrop,
      previousCrop,
      season,
      soilType,
      irrigation,
      waterSource,
      priorities,
      userId = 'guest_user',
    } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Name, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    try {
      const conn = await connectToDatabase();
      if (conn) {
        const newFarm = await Farm.create({
          userId,
          name,
          locationName: locationName || 'Bangladesh Farm',
          latitude: Number(latitude),
          longitude: Number(longitude),
          boundary: boundary || [],
          area: Number(area) || 33,
          areaUnit: areaUnit || 'decimal',
          currentCrop: currentCrop || 'T. Aman Rice',
          previousCrop: previousCrop || 'Aus Rice',
          season: season || 'Rabi',
          soilType: soilType || 'alluvial',
          irrigation: irrigation || 'partial',
          waterSource: waterSource || 'groundwater',
          priorities: priorities || ['soil_health', 'climate_resilience'],
        });

        return NextResponse.json({ success: true, farm: newFarm }, { status: 201 });
      }
    } catch (dbErr: any) {
      console.warn('DB Farm creation failed, returning memory fallback:', dbErr.message);
    }

    // In-memory fallback response
    const mockFarm = {
      _id: 'farm_' + Date.now(),
      userId,
      name,
      locationName: locationName || 'Bangladesh Farm',
      latitude: Number(latitude),
      longitude: Number(longitude),
      boundary: boundary || [],
      area: Number(area) || 33,
      areaUnit: areaUnit || 'decimal',
      currentCrop: currentCrop || 'T. Aman Rice',
      previousCrop: previousCrop || 'Aus Rice',
      season: season || 'Rabi',
      soilType: soilType || 'alluvial',
      irrigation: irrigation || 'partial',
      waterSource: waterSource || 'groundwater',
      priorities: priorities || ['soil_health', 'climate_resilience'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, farm: mockFarm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
