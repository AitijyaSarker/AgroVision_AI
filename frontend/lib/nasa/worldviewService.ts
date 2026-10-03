/**
 * NASA GIBS (Global Imagery Browse Services) & Worldview Tile Integration
 * Provides standard Leaflet WMTS tile URLs for farm-level visualization.
 */

export interface NASAGIBSLayer {
  id: string;
  nameEn: string;
  nameBn: string;
  urlTemplate: string;
  format: 'jpg' | 'png';
  attribution: string;
  descriptionEn: string;
  descriptionBn: string;
  maxZoom: number;
}

export const NASA_GIBS_LAYERS: Record<string, NASAGIBSLayer> = {
  true_color: {
    id: 'true_color',
    nameEn: 'True Color (VIIRS / MODIS)',
    nameBn: 'প্রাকৃতিক দৃশ্য (ভিআইআইআরএস / মডিস)',
    urlTemplate:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    format: 'jpg',
    attribution: 'NASA EOSDIS GIBS / VIIRS True Color',
    descriptionEn: 'Daily natural color satellite imagery showing field boundaries, rivers, and cloud cover.',
    descriptionBn: 'প্রতিদিনের প্রাকৃতিক রঙের স্যাটেলাইট ছবি যা খামার, নদী এবং মেঘের অবস্থান দেখায়।',
    maxZoom: 9,
  },
  soil_moisture: {
    id: 'soil_moisture',
    nameEn: 'Soil Moisture (SMAP L4)',
    nameBn: 'মাটির আর্দ্রতা স্তর (এসএমএপি)',
    urlTemplate:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L4_SM_RootZone_Wetness/default/{time}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
    format: 'png',
    attribution: 'NASA EOSDIS GIBS / SMAP Land Surface',
    descriptionEn: 'Root-zone water content showing dry versus well-watered agricultural regions.',
    descriptionBn: 'মাটির শিকড় অঞ্চলের আর্দ্রতা স্তর যা শুষ্ক বনাম পর্যাপ্ত পানির অঞ্চল চিহ্নিত করে।',
    maxZoom: 7,
  },
  precipitation: {
    id: 'precipitation',
    nameEn: 'Rainfall Rate (GPM IMERG)',
    nameBn: 'বৃষ্টির পরিমাণ (জিপিএম)',
    urlTemplate:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/{time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
    format: 'png',
    attribution: 'NASA EOSDIS GIBS / GPM IMERG',
    descriptionEn: 'Satellite precipitation radar showing rain fronts and accumulation over the area.',
    descriptionBn: 'স্যাটেলাইট বৃষ্টিপাত স্তর যা এলাকায় বৃষ্টির গতিবিধি ও পরিমাণ প্রদর্শন করে।',
    maxZoom: 6,
  },
  ndvi: {
    id: 'ndvi',
    nameEn: 'Vegetation Greenness (NDVI)',
    nameBn: 'সবুজ উদ্ভিদের ঘনত্ব (এনডিভিআই)',
    urlTemplate:
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
    format: 'png',
    attribution: 'NASA EOSDIS GIBS / MODIS NDVI 8-Day',
    descriptionEn: '8-day composite indicating crop canopy density and relative photosynthetic vigor.',
    descriptionBn: 'ফসলের পাতার ঘনত্ব এবং সালোকসংশ্লেষণের মাত্রা প্রকাশক ৮ দিনের সমন্বিত চিত্র।',
    maxZoom: 9,
  },
};

/**
 * Returns formatted date string (YYYY-MM-DD) suitable for GIBS requests.
 * Uses yesterday's or 2 days ago date to account for tile generation latency.
 */
export function getGIBSDateString(offsetDays: number = 2): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getGIBSLayerUrl(layerId: string, offsetDays: number = 2): string {
  const layer = NASA_GIBS_LAYERS[layerId] || NASA_GIBS_LAYERS.true_color;
  const dateStr = getGIBSDateString(offsetDays);
  return layer.urlTemplate.replace('{time}', dateStr);
}
