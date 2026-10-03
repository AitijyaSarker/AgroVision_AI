import { connectToDatabase } from '../mongodb';
import { NASAObservation } from '../models/NASAObservation';
import { FarmConditionReport } from './normalizer';
import { fetchNASAPowerData } from './powerClient';

// In-memory cache for fast dev/serverless caching
const memoryCache = new Map<string, { report: FarmConditionReport; expiresAt: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function getCachedOrFreshNASAData(
  latitude: number,
  longitude: number,
  farmId?: string,
  locationName: string = 'Farm Location'
): Promise<FarmConditionReport> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const now = Date.now();

  // 1. Check in-memory cache
  const inMem = memoryCache.get(cacheKey);
  if (inMem && inMem.expiresAt > now) {
    return {
      ...inMem.report,
      isCached: true,
      farmId: farmId || inMem.report.farmId,
    };
  }

  // 2. Check MongoDB cache if connected
  try {
    const conn = await connectToDatabase();
    if (conn && farmId) {
      const cachedDoc = await NASAObservation.findOne({
        farmId,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (cachedDoc) {
        // Doc found and valid, fetch live or reconstruct
      }
    }
  } catch (err) {
    console.warn('MongoDB cache lookup skipped:', (err as Error).message);
  }

  // 3. Fetch fresh data from NASA POWER / GPM / SMAP
  const freshReport = await fetchNASAPowerData(latitude, longitude, locationName);
  freshReport.farmId = farmId;
  freshReport.isCached = false;

  // Save to in-memory cache
  memoryCache.set(cacheKey, {
    report: freshReport,
    expiresAt: now + CACHE_TTL_MS,
  });

  // Save to MongoDB asynchronously if connected
  if (farmId) {
    saveToMongoObservation(farmId, latitude, longitude, freshReport).catch((err) =>
      console.warn('Async observation save warning:', err.message)
    );
  }

  return freshReport;
}

async function saveToMongoObservation(
  farmId: string,
  latitude: number,
  longitude: number,
  report: FarmConditionReport
) {
  try {
    const conn = await connectToDatabase();
    if (!conn) return;

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

    // Save key parameters
    const observations = [
      {
        farmId,
        latitude,
        longitude,
        source: 'NASA POWER',
        parameter: 'T2M',
        value: report.weather.currentTemp,
        unit: '°C',
        spatialResolution: '0.5 deg',
        quality: report.weather.provenance.dataQuality,
        expiresAt,
      },
      {
        farmId,
        latitude,
        longitude,
        source: 'NASA GPM IMERG',
        parameter: 'PRECTOTCORR',
        value: report.precipitation.recent30DaysMm,
        unit: 'mm',
        spatialResolution: '0.1 deg',
        quality: report.precipitation.provenance.dataQuality,
        expiresAt,
      },
      {
        farmId,
        latitude,
        longitude,
        source: 'NASA SMAP',
        parameter: 'GWETTOP',
        value: report.soilMoisture.surfaceWetness,
        unit: 'fraction (0-1)',
        spatialResolution: '9 km',
        quality: report.soilMoisture.provenance.dataQuality,
        expiresAt,
      },
      {
        farmId,
        latitude,
        longitude,
        source: 'NASA HLS',
        parameter: 'NDVI',
        value: report.vegetation.ndviValue,
        unit: 'index (0-1)',
        spatialResolution: '30 m',
        quality: report.vegetation.provenance.dataQuality,
        expiresAt,
      },
    ];

    await NASAObservation.insertMany(observations);
  } catch (err) {
    // Non-fatal logging
    console.warn('Could not persist NASA observation to MongoDB:', (err as Error).message);
  }
}
