import type { VisionDetection } from './gemini-vision'

const CROP_BN: Record<string, string> = {
  rice: 'ধান',
  wheat: 'গম',
  jute: 'পাট',
  potato: 'আলু',
  tomato: 'টমেটো',
  maize: 'ভুট্টা',
  corn: 'ভুট্টা',
  mango: 'আম',
  banana: 'কলা',
  chili: 'মরিচ',
  chilli: 'মরিচ',
  onion: 'পেঁয়াজ',
  garlic: 'রসুন',
  cucumber: 'শসা',
  eggplant: 'বেগুন',
  brinjal: 'বেগুন',
  cabbage: 'বাঁধাকপি',
  cauliflower: 'ফুলকপি',
  lentil: 'মসুর',
  soybean: 'সয়াবিন',
  sugarcane: 'আখ',
  healthy: 'সুস্থ',
}

const DISEASE_BN: Record<string, string> = {
  healthy: 'সুস্থ',
  'common scab': 'সাধারণ স্ক্যাব',
  'late blight': 'লেট ব্লাইট',
  'early blight': 'আর্লি ব্লাইট',
  'leaf blight': 'পাতা পচা',
  'bacterial blight': 'ব্যাকটেরিয়াল ব্লাইট',
  'brown spot': 'বাদামী দাগ রোগ',
  'leaf blast': 'পাতা ব্লাস্ট',
  'rice blast': 'ধান ব্লাস্ট',
  'sheath blight': 'শীথ ব্লাইট',
  'powdery mildew': 'পাউডারি মিলডিউ',
  'downy mildew': 'ডাউনি মিলডিউ',
  'root rot': 'মূল পচা',
  'stem rot': 'কাণ্ড পচা',
  'wilt': 'উইল্ট',
  'rust': 'মরিচা রোগ',
  'anthracnose': 'অ্যানথ্রাকনোজ',
  'mosaic virus': 'মোজাইক ভাইরাস',
  'bacterial wilt': 'ব্যাকটেরিয়াল উইল্ট',
  'black spot': 'কালো দাগ',
  'leaf spot': 'পাতার দাগ',
  'tikka disease': 'টিক্কা রোগ',
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function looksEnglish(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const bengali = (trimmed.match(/[\u0980-\u09FF]/g) || []).length
  const latin = (trimmed.match(/[a-zA-Z]/g) || []).length
  return latin > bengali
}

export function localizeLabelToBengali(value: string, map: Record<string, string>): string {
  const key = normalizeKey(value)
  if (map[key]) return map[key]
  for (const [en, bn] of Object.entries(map)) {
    if (key.includes(en)) return bn
  }
  return value
}

export function localizeScanLabels(detection: VisionDetection): VisionDetection {
  return {
    ...detection,
    cropName: localizeLabelToBengali(detection.cropName, CROP_BN),
    diseaseName: localizeLabelToBengali(detection.diseaseName, DISEASE_BN),
  }
}

export function scanNeedsBengaliTranslation(detection: VisionDetection): boolean {
  if (looksEnglish(detection.diseaseName) || looksEnglish(detection.cropName)) return true
  if (looksEnglish(detection.description)) return true
  if (detection.solution.some(looksEnglish)) return true
  if (detection.prevention.some(looksEnglish)) return true
  return false
}
