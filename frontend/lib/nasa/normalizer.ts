/**
 * NASA Data Normalizer & Provenance Metadata Engine
 * Standardizes raw NASA Earth observation parameters into scientifically honest,
 * farmer-friendly metrics with transparent resolution, uncertainty, and source attribution.
 */

export interface ProvenanceMetadata {
  source: string;
  sourceLongName: string;
  citation: string;
  spatialResolution: string;
  temporalCoverage: string;
  retrievedAt: string;
  dataQuality: 'verified' | 'provisional' | 'modeled' | 'cached' | 'demo';
  disclaimer: string;
}

export interface NormalizedWeather {
  currentTemp: number; // °C
  tempMax: number; // °C
  tempMin: number; // °C
  tempAnomaly: number; // °C relative to climatology
  relativeHumidity: number; // %
  solarRadiation: number; // MJ/m^2/day
  dailyHistory: {
    date: string;
    temp: number;
    tempMax: number;
    tempMin: number;
    precipitation: number;
  }[];
  provenance: ProvenanceMetadata;
}

export interface NormalizedPrecipitation {
  recent7DaysMm: number;
  recent30DaysMm: number;
  dailyAverageMm: number;
  normalMonthlyMm: number;
  departurePercentage: number; // e.g. -25% or +40%
  status: 'severely_dry' | 'moderately_dry' | 'near_normal' | 'moderately_wet' | 'excessive_rain';
  dailyHistory: {
    date: string;
    precipitation: number;
  }[];
  provenance: ProvenanceMetadata;
}

export interface NormalizedSoilMoisture {
  surfaceWetness: number; // 0.0 - 1.0 (GWETTOP)
  rootZoneWetness: number; // 0.0 - 1.0 (GWETROOT)
  status: 'critically_low' | 'low' | 'adequate' | 'saturated' | 'waterlogged';
  trend: 'drying' | 'stable' | 'increasing';
  dailyHistory: {
    date: string;
    surfaceWetness: number;
    rootZoneWetness: number;
  }[];
  provenance: ProvenanceMetadata;
}

export interface NormalizedVegetation {
  ndviValue: number; // 0.0 - 1.0
  vegetationCondition: 'stressed' | 'fair' | 'healthy' | 'vigorous';
  thirtyDayTrend: 'declining' | 'stable' | 'greening';
  trendRate: number; // slope
  dailyHistory: {
    date: string;
    ndvi: number;
  }[];
  provenance: ProvenanceMetadata;
}

export interface FarmConditionReport {
  farmId?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  weather: NormalizedWeather;
  precipitation: NormalizedPrecipitation;
  soilMoisture: NormalizedSoilMoisture;
  vegetation: NormalizedVegetation;
  fetchedAt: string;
  isCached: boolean;
}

export const NASA_SOURCES = {
  POWER: {
    source: 'NASA POWER',
    sourceLongName: 'NASA Prediction of Worldwide Energy Resources (Agroclimatology)',
    citation: 'NASA Langley Research Center POWER Project (MERRA-2 & GEOS-FP assimilation)',
    spatialResolution: '0.5° × 0.5° (~50 km)',
    disclaimer: 'Area-level satellite and meteorological assimilation estimate. Not an in-situ ground station sensor.',
  },
  GPM: {
    source: 'NASA GPM IMERG',
    sourceLongName: 'Global Precipitation Measurement (GPM) Integrated Multi-satellite Retrievals',
    citation: 'NASA Goddard Space Flight Center GPM Science Team',
    spatialResolution: '0.1° × 0.1° (~10 km)',
    disclaimer: 'Precipitation estimates reflect satellite-detected radar/radiometer rates, which may smooth extreme localized convective cloudbursts.',
  },
  SMAP: {
    source: 'NASA SMAP / Land Wetness',
    sourceLongName: 'Soil Moisture Active Passive (SMAP) / MERRA-2 Catchment Land Surface',
    citation: 'NASA Jet Propulsion Laboratory & Goddard Earth Sciences Data and Information Services',
    spatialResolution: '9 km / 0.5° blended grid',
    disclaimer: 'Top 0-5 cm and root-zone water content estimates represent volumetric saturation fractions across the observation cell.',
  },
  HLS: {
    source: 'NASA HLS / MODIS / VIIRS',
    sourceLongName: 'Harmonized Landsat Sentinel-2 & MODIS Vegetation Greenness',
    citation: 'NASA LP DAAC / USGS Land Processes Distributed Active Archive Center',
    spatialResolution: '30 m (HLS) to 250 m (MODIS)',
    disclaimer: 'Vegetation greenness index (NDVI) indicates relative chlorophyll vigor. It is an environmental stress indicator, not a definitive disease diagnosis.',
  },
};
