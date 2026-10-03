export interface CropProfile {
  id: string;
  nameEn: string;
  nameBn: string;
  cropFamily: string;
  seasons: ('Kharif-1' | 'Kharif-2' | 'Rabi' | 'All-Season')[];
  durationDays: string;
  waterNeed: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  droughtTolerance: 'low' | 'medium' | 'high';
  waterloggingTolerance: 'low' | 'medium' | 'high';
  tempSuitability: { min: number; optimal: number; max: number };
  soilPreferences: string[];
  soilHealthBenefit: 'high' | 'medium' | 'neutral' | 'depleting';
  economicCost: 'low' | 'medium' | 'high';
  yieldPotential: 'medium' | 'high' | 'very_high';
  rotationCompatibility: string[]; // crop IDs it pairs well with
  incompatiblePreceding: string[]; // crops to avoid directly after
  descriptionEn: string;
  descriptionBn: string;
  agronomicTipsEn: string[];
  agronomicTipsBn: string[];
}

export const BANGLADESH_CROPS: CropProfile[] = [
  {
    id: 'aman_rice',
    nameEn: 'T. Aman Rice',
    nameBn: 'রোপা আমন ধান',
    cropFamily: 'Poaceae (Gramineae)',
    seasons: ['Kharif-2'],
    durationDays: '120-140 days',
    waterNeed: 'high',
    droughtTolerance: 'medium',
    waterloggingTolerance: 'high',
    tempSuitability: { min: 20, optimal: 28, max: 35 },
    soilPreferences: ['clay', 'alluvial', 'silt_loam'],
    soilHealthBenefit: 'neutral',
    economicCost: 'medium',
    yieldPotential: 'high',
    rotationCompatibility: ['mustard', 'lentil', 'wheat', 'potato', 'mung_bean'],
    incompatiblePreceding: [],
    descriptionEn: 'Monsoon staple rice crop grown widely across Bangladesh floodplains, well adapted to wet soils.',
    descriptionBn: 'বাংলাদেশের প্রধান বর্ষাকালীন ধান ফসল, যা বর্ষার পানি ও ভেজা মাটিতে চমৎকারভাবে বাড়ে।',
    agronomicTipsEn: [
      'Ideal for heavy monsoon rainfall conditions',
      'Follow with short-duration mustard or pulses to conserve residual soil moisture',
    ],
    agronomicTipsBn: [
      'বর্ষার আর্দ্র পরিবেশের জন্য উপযোগী',
      'ফসল তোলার পর অবশিষ্ট আর্দ্রতা কাজে লাগাতে সরিষা বা ডাল ফসল রোপণ করুন',
    ],
  },
  {
    id: 'boro_rice',
    nameEn: 'Boro Rice',
    nameBn: 'বোরো ধান',
    cropFamily: 'Poaceae (Gramineae)',
    seasons: ['Rabi'],
    durationDays: '140-160 days',
    waterNeed: 'very_high',
    droughtTolerance: 'low',
    waterloggingTolerance: 'medium',
    tempSuitability: { min: 18, optimal: 25, max: 32 },
    soilPreferences: ['clay', 'alluvial'],
    soilHealthBenefit: 'depleting',
    economicCost: 'high',
    yieldPotential: 'very_high',
    rotationCompatibility: ['aus_rice', 'jute', 'mung_bean'],
    incompatiblePreceding: [],
    descriptionEn: 'High-yielding winter rice requiring intensive irrigation, heavily dependent on groundwater availability.',
    descriptionBn: 'শীতকালীন উচ্চফলনশীল ধান, যার জন্য পর্যাপ্ত সেচ ও ভূগর্ভস্থ পানির প্রয়োজন হয়।',
    agronomicTipsEn: [
      'Requires reliable irrigation source throughout dry season',
      'In water-stressed zones, consider replacing with wheat, maize, or legumes',
    ],
    agronomicTipsBn: [
      'শুষ্ক মৌসুমজুড়ে নির্ভরযোগ্য সেচ নিশ্চিত থাকা জরুরি',
      'পানির সংকটপ্রবণ এলাকায় গম, ভুট্টা বা ডাল ফসল দিয়ে বিকল্প ভাবা উচিত',
    ],
  },
  {
    id: 'mustard',
    nameEn: 'Mustard / Rapeseed',
    nameBn: 'সরিষা',
    cropFamily: 'Brassicaceae',
    seasons: ['Rabi'],
    durationDays: '75-85 days',
    waterNeed: 'low',
    droughtTolerance: 'medium',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 12, optimal: 20, max: 28 },
    soilPreferences: ['sandy_loam', 'alluvial', 'silt_loam'],
    soilHealthBenefit: 'medium',
    economicCost: 'low',
    yieldPotential: 'medium',
    rotationCompatibility: ['aman_rice', 'boro_rice', 'mung_bean'],
    incompatiblePreceding: [],
    descriptionEn: 'Short-duration oilseed ideal for planting between Aman harvest and late Boro or summer crops.',
    descriptionBn: 'স্বল্পমেয়াদী তৈলবীজ ফসল, যা আমন ধান কাটার পর এবং বোরো বা গ্রীষ্মকালীন ফসলের মাঝে চমৎকার খাপ খায়।',
    agronomicTipsEn: [
      'Minimal water requirement; thrives on residual moisture with only 1-2 light irrigations',
      'Improves farm cash flow and frees land quickly',
    ],
    agronomicTipsBn: [
      'খুব কম পানি লাগে; মাটির অবশিষ্ট রসে মাত্র ১-২টি হালকা সেচে ভালো ফলন হয়',
      'দ্রুত জমি খালি করে এবং কৃষকের আর্থিক সচ্ছলতা বাড়ায়',
    ],
  },
  {
    id: 'lentil',
    nameEn: 'Lentil (Masoor)',
    nameBn: 'মসুর ডাল',
    cropFamily: 'Fabaceae (Legumes)',
    seasons: ['Rabi'],
    durationDays: '100-110 days',
    waterNeed: 'very_low',
    droughtTolerance: 'high',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 14, optimal: 22, max: 30 },
    soilPreferences: ['alluvial', 'silt_loam', 'clay'],
    soilHealthBenefit: 'high',
    economicCost: 'low',
    yieldPotential: 'medium',
    rotationCompatibility: ['aman_rice', 'aus_rice', 'jute'],
    incompatiblePreceding: ['lentil'],
    descriptionEn: 'Climate-resilient, nitrogen-fixing legume that enriches soil biology while requiring negligible irrigation.',
    descriptionBn: 'জলবায়ু সহনশীল ডালজাতীয় ফসল, যা মাটিতে প্রাকৃতিক নাইট্রোজেন যুক্ত করে এবং খুব কম সেচে উৎপাদিত হয়।',
    agronomicTipsEn: [
      'Fixes atmospheric nitrogen, reducing subsequent urea fertilizer expenses by 25-35%',
      'Sensitive to water stagnation; requires well-drained beds',
    ],
    agronomicTipsBn: [
      'বাতাস থেকে নাইট্রোজেন সংবন্ধন করে পরবর্তী ফসলে ইউরিয়া সারের খরচ ২৫-৩৫% কমায়',
      'জলাবদ্ধতা সহ্য করতে পারে না; পানি নিষ্কাশনের ব্যবস্থা রাখুন',
    ],
  },
  {
    id: 'mung_bean',
    nameEn: 'Mung Bean (Moog)',
    nameBn: 'মুগ ডাল',
    cropFamily: 'Fabaceae (Legumes)',
    seasons: ['Kharif-1', 'Rabi'],
    durationDays: '60-70 days',
    waterNeed: 'low',
    droughtTolerance: 'high',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 22, optimal: 30, max: 38 },
    soilPreferences: ['sandy_loam', 'alluvial', 'silt_loam'],
    soilHealthBenefit: 'high',
    economicCost: 'low',
    yieldPotential: 'medium',
    rotationCompatibility: ['aman_rice', 'wheat', 'potato', 'mustard'],
    incompatiblePreceding: [],
    descriptionEn: 'Rapid 60-day summer pulse that restores depleted nutrients and breaks pest cycles between major cereals.',
    descriptionBn: '৬০ দিনে ঘরে তোলা উপযোগী গ্রীষ্মকালীন ডাল, যা মাটির পুষ্টি ফেরায় এবং ফসলের পোকা-মাকড়ের চক্র ভাঙে।',
    agronomicTipsEn: [
      'Biomass can be incorporated into the soil as green manure after pod harvesting',
      'Thrives in warm transition windows',
    ],
    agronomicTipsBn: [
      'ডাল তোলার পর উদ্ভিদের অবশিষ্ট অংশ সবুজ সার হিসেবে জমিতে মিশিয়ে মাটির উর্বরতা বাড়ানো যায়',
      'গ্রীষ্মের শুরুতে স্বল্প সময়ে ফলন দেয়',
    ],
  },
  {
    id: 'wheat',
    nameEn: 'Wheat',
    nameBn: 'গম',
    cropFamily: 'Poaceae (Gramineae)',
    seasons: ['Rabi'],
    durationDays: '105-115 days',
    waterNeed: 'moderate',
    droughtTolerance: 'medium',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 14, optimal: 20, max: 28 },
    soilPreferences: ['silt_loam', 'alluvial', 'clay'],
    soilHealthBenefit: 'neutral',
    economicCost: 'medium',
    yieldPotential: 'high',
    rotationCompatibility: ['aman_rice', 'jute', 'mung_bean'],
    incompatiblePreceding: [],
    descriptionEn: 'Major winter cereal requiring significantly less irrigation water than Boro rice (2-3 irrigations vs 15-20).',
    descriptionBn: 'প্রধান শীতকালীন দানাদার ফসল, যা বোরো ধানের চেয়ে বহুগুণ কম পানি ব্যবহার করে (মাত্র ২-৩টি সেচ)।',
    agronomicTipsEn: [
      'Excellent water-saving substitute for Boro in drought-prone or groundwater-depleted regions',
      'Plant by mid-November to avoid terminal heat stress in February',
    ],
    agronomicTipsBn: [
      'ভূগর্ভস্থ পানির টান কমাতে বোরো ধানের উৎকৃষ্ট সাশ্রয়ী বিকল্প',
      'নভেম্বরের মাঝামাঝি রোপণ করলে ফেব্রুয়ারির শেষভাগের তাপজনিত ক্ষতি এড়ানো যায়',
    ],
  },
  {
    id: 'maize',
    nameEn: 'Maize / Corn',
    nameBn: 'ভুট্টা',
    cropFamily: 'Poaceae (Gramineae)',
    seasons: ['Rabi', 'Kharif-1'],
    durationDays: '130-145 days',
    waterNeed: 'moderate',
    droughtTolerance: 'medium',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 18, optimal: 26, max: 35 },
    soilPreferences: ['alluvial', 'sandy_loam', 'silt_loam'],
    soilHealthBenefit: 'neutral',
    economicCost: 'medium',
    yieldPotential: 'very_high',
    rotationCompatibility: ['aman_rice', 'mung_bean', 'mustard'],
    incompatiblePreceding: [],
    descriptionEn: 'High-value grain with high yield and expanding poultry/feed market demand in Bangladesh.',
    descriptionBn: 'উচ্চফলনশীল অর্থকরী দানাশস্য, যার দেশে পোল্ট্রি ও ফিড মিলে ব্যাপক চাহিদা রয়েছে।',
    agronomicTipsEn: [
      'Substantially higher profit margins per acre compared to traditional winter cereals',
      'Requires moderate irrigation during tasseling and grain filling',
    ],
    agronomicTipsBn: [
      'ঐতিহ্যবাহী দানাদার ফসলের তুলনায় প্রতি একরে বেশি লাভজনক',
      'মোচা আসা ও দানা পুষ্ট হওয়ার সময় প্রয়োজনীয় সেচ নিশ্চিত করুন',
    ],
  },
  {
    id: 'potato',
    nameEn: 'Potato',
    nameBn: 'আলু',
    cropFamily: 'Solanaceae',
    seasons: ['Rabi'],
    durationDays: '85-95 days',
    waterNeed: 'moderate',
    droughtTolerance: 'low',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 12, optimal: 18, max: 25 },
    soilPreferences: ['sandy_loam', 'silt_loam', 'alluvial'],
    soilHealthBenefit: 'medium',
    economicCost: 'high',
    yieldPotential: 'very_high',
    rotationCompatibility: ['aman_rice', 'jute', 'mung_bean'],
    incompatiblePreceding: ['potato', 'tomato', 'eggplant'],
    descriptionEn: 'High-return winter tuber crop; sensitive to warm spells and waterlogging but highly productive.',
    descriptionBn: 'উচ্চ মুনাফাযুক্ত শীতকালীন কন্দজাতীয় ফসল; অতিরিক্ত উষ্ণতা ও জলাবদ্ধতায় সংবেদনশীল হলেও ফলন ব্যাপক।',
    agronomicTipsEn: [
      'Thrives in friable, well-drained sandy loam soils',
      'Rotate with legumes to restore potash and nitrogen reserves',
    ],
    agronomicTipsBn: [
      'ঝরঝরে ও ভালো নিষ্কাশনযুক্ত বেলে-দোআঁশ মাটিতে সবচেয়ে ভালো হয়',
      'আলু তোলার পর জমিতে ডাল ফসল লাগিয়ে মাটির ভারসাম্য বজায় রাখুন',
    ],
  },
  {
    id: 'jute',
    nameEn: 'Jute (Pat)',
    nameBn: 'পাট',
    cropFamily: 'Malvaceae',
    seasons: ['Kharif-1'],
    durationDays: '110-120 days',
    waterNeed: 'high',
    droughtTolerance: 'medium',
    waterloggingTolerance: 'high',
    tempSuitability: { min: 24, optimal: 32, max: 38 },
    soilPreferences: ['alluvial', 'clay', 'silt_loam'],
    soilHealthBenefit: 'high',
    economicCost: 'low',
    yieldPotential: 'high',
    rotationCompatibility: ['aman_rice', 'mustard', 'wheat', 'lentil', 'potato'],
    incompatiblePreceding: [],
    descriptionEn: 'Golden fiber crop with tremendous soil conditioning benefits; leaf shed provides rich organic humus.',
    descriptionBn: 'সোনালী আঁশ ফসল, যার ঝরে পড়া পাতা জমিতে প্রচুর জৈব পদার্থ যুক্ত করে মাটির স্বাস্থ্য উন্নত করে।',
    agronomicTipsEn: [
      'Grown during pre-monsoon Kharif-1; tolerates heavy rainfall and riverine inundation',
      'Leaves 2-3 tons of organic matter per hectare into the topsoil',
    ],
    agronomicTipsBn: [
      'প্রাক-বর্ষা মৌসুমে বপন করা হয়; ভারী বৃষ্টি ও বন্যার পানিতে টিকে থাকে',
      'প্রতি হেক্টরে প্রায় ২-৩ টন জৈব পাতা জমিতে ফেলে মাটির উর্বরতা বৃদ্ধি করে',
    ],
  },
  {
    id: 'groundnut',
    nameEn: 'Groundnut / Peanut',
    nameBn: 'চীনাবাদাম',
    cropFamily: 'Fabaceae (Legumes)',
    seasons: ['Rabi', 'Kharif-1'],
    durationDays: '120-135 days',
    waterNeed: 'low',
    droughtTolerance: 'high',
    waterloggingTolerance: 'low',
    tempSuitability: { min: 20, optimal: 28, max: 34 },
    soilPreferences: ['sandy_loam', 'alluvial'],
    soilHealthBenefit: 'high',
    economicCost: 'low',
    yieldPotential: 'high',
    rotationCompatibility: ['aman_rice', 'wheat', 'jute'],
    incompatiblePreceding: [],
    descriptionEn: 'Drought-tolerant leguminous oilseed ideal for riverine chars (shoals) and sandy soil tracts.',
    descriptionBn: 'খরাসহনশীল তৈলবীজ ফসল, যা চরাঞ্চল এবং বেলে মাটির জমিতে চমৎকার উৎপাদন দেয়।',
    agronomicTipsEn: [
      'Highly resilient in dry spells and requires minimal fertilizer due to root nodules',
      'Provides high market value with low input costs',
    ],
    agronomicTipsBn: [
      'খরার মধ্যে অত্যন্ত টেকসই এবং মূলের নডিউলের কারণে রাসায়নিক সারের ব্যবহার প্রায় লাগে না',
      'স্বল্প খরচে চরাঞ্চলে চাষ করে বেশি লাভ পাওয়া যায়',
    ],
  },
];

export function getCropById(id: string): CropProfile | undefined {
  return BANGLADESH_CROPS.find((c) => c.id === id);
}

export function getCropsForSeason(season: 'Kharif-1' | 'Kharif-2' | 'Rabi' | 'All-Season'): CropProfile[] {
  return BANGLADESH_CROPS.filter((c) => c.seasons.includes(season) || c.seasons.includes('All-Season'));
}
