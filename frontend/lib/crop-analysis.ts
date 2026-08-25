/**
 * Heuristic crop disease analysis from image statistics.
 * Used when the Python AI server is unavailable.
 */

export interface DetectionResult {
  crop: string
  disease: string
  confidence: number
  solution: string
  description: string
}

const SOLUTIONS_EN: Record<string, string> = {
  Healthy:
    'Your crop looks healthy. Continue balanced fertilization, proper irrigation, and regular field monitoring.',
  'Brown Spot':
    'Remove crop residues, use balanced fertilizers, and apply fungicides such as Propiconazole or Tricyclazole.',
  'Bacterial Blight':
    'Use resistant varieties, avoid overhead irrigation, and apply copper-based bactericides early.',
  'Leaf Blast':
    'Apply fungicides at early stages, use resistant varieties, and maintain proper plant spacing.',
  'Rice Blast':
    'Use systemic fungicides, improve drainage, and avoid excessive nitrogen fertilizer.',
  'Sheath Blight':
    'Apply fungicides, maintain proper spacing, and avoid prolonged waterlogging in the field.',
}

const SOLUTIONS_BN: Record<string, string> = {
  Healthy:
    'আপনার ফসল সুস্থ দেখাচ্ছে। সুষম সার, সঠিক সেচ এবং নিয়মিত পর্যবেক্ষণ চালিয়ে যান।',
  'Brown Spot':
    'ফসলের অবশিষ্টাংশ সরান, সুষম সার ব্যবহার করুন এবং প্রোপিকোনাজল বা ট্রাইসাইক্লাজল জাতীয় ফাঙ্গিসাইড প্রয়োগ করুন।',
  'Bacterial Blight':
    'প্রতিরোধী জাত ব্যবহার করুন, ওভারহেড সেচ এড়িয়ে চলুন এবং তামা-ভিত্তিক ব্যাকটেরিসাইড প্রয়োগ করুন।',
  'Leaf Blast':
    'প্রাথমিক পর্যায়ে ফাঙ্গিসাইড প্রয়োগ করুন, প্রতিরোধী জাত ব্যবহার করুন এবং গাছের মধ্যে সঠিক দূরত্ব রাখুন।',
  'Rice Blast':
    'সিস্টেমিক ফাঙ্গিসাইড ব্যবহার করুন, নিষ্কাশন উন্নত করুন এবং অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন।',
  'Sheath Blight':
    'ফাঙ্গিসাইড প্রয়োগ করুন, সঠিক দূরত্ব বজায় রাখুন এবং ক্ষেতে দীর্ঘদিন জল জমা হতে দেবেন না।',
}

const DISEASE_BN: Record<string, string> = {
  Healthy: 'সুস্থ',
  'Brown Spot': 'বাদামী দাগ রোগ',
  'Bacterial Blight': 'ব্যাকটেরিয়াল ব্লাইট',
  'Leaf Blast': 'পাতা ব্লাস্ট',
  'Rice Blast': 'ধান ব্লাস্ট',
  'Sheath Blight': 'শীথ ব্লাইট',
}

type Rgb = { r: number; g: number; b: number }

function classifyFromStats(
  greenRatio: number,
  brownRatio: number,
  yellowRatio: number,
  darkRatio: number,
  lesionScore: number
): { disease: string; confidence: number } {
  if (greenRatio > 0.55 && brownRatio < 0.06 && yellowRatio < 0.08 && lesionScore < 0.04) {
    return { disease: 'Healthy', confidence: 88 + Math.min(10, greenRatio * 12) }
  }

  if (brownRatio > 0.14 || lesionScore > 0.12) {
    const confidence = 72 + Math.min(22, (brownRatio + lesionScore) * 80)
    if (lesionScore > 0.18 && brownRatio > 0.1) {
      return { disease: 'Brown Spot', confidence }
    }
    if (yellowRatio > brownRatio) {
      return { disease: 'Leaf Blast', confidence: confidence - 4 }
    }
    return { disease: 'Brown Spot', confidence }
  }

  if (yellowRatio > 0.12 && greenRatio < 0.45) {
    return { disease: 'Leaf Blast', confidence: 70 + yellowRatio * 60 }
  }

  if (darkRatio > 0.1 && greenRatio < 0.4) {
    return { disease: 'Rice Blast', confidence: 68 + darkRatio * 50 }
  }

  if (brownRatio > 0.08 && lesionScore > 0.06) {
    return { disease: 'Bacterial Blight', confidence: 65 + lesionScore * 80 }
  }

  if (greenRatio > 0.35 && lesionScore > 0.05) {
    return { disease: 'Sheath Blight', confidence: 62 + lesionScore * 70 }
  }

  if (brownRatio > yellowRatio) {
    return { disease: 'Brown Spot', confidence: 60 + brownRatio * 100 }
  }

  return { disease: 'Healthy', confidence: 55 + greenRatio * 30 }
}

/** Sample pixels from raw RGBA buffer (from sharp). */
export function analyzeImageBuffer(
  data: Buffer,
  width: number,
  height: number,
  language: string
): DetectionResult {
  const channels = 3
  const step = Math.max(1, Math.floor(Math.min(width, height) / 128))
  let green = 0
  let brown = 0
  let yellow = 0
  let dark = 0
  let lesion = 0
  let samples = 0

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * channels
      const rgb: Rgb = { r: data[i], g: data[i + 1], b: data[i + 2] }
      samples++

      const max = Math.max(rgb.r, rgb.g, rgb.b)
      const min = Math.min(rgb.r, rgb.g, rgb.b)
      const saturation = max === 0 ? 0 : (max - min) / max

      if (rgb.g > rgb.r + 15 && rgb.g > rgb.b + 10 && rgb.g > 60) green++
      if (
        rgb.r > 80 &&
        rgb.g > 40 &&
        rgb.b < 90 &&
        rgb.r > rgb.b &&
        saturation > 0.15
      ) {
        brown++
      }
      if (rgb.r > 150 && rgb.g > 120 && rgb.b < 100) yellow++
      if (max < 55) dark++

      const isBrownSpot =
        rgb.r > 70 &&
        rgb.g > 35 &&
        rgb.g < rgb.r &&
        rgb.b < rgb.g &&
        saturation > 0.2
      const isDarkLesion = max < 70 && rgb.g < rgb.r
      if (isBrownSpot || isDarkLesion) lesion++
    }
  }

  const greenRatio = green / samples
  const brownRatio = brown / samples
  const yellowRatio = yellow / samples
  const darkRatio = dark / samples
  const lesionScore = lesion / samples

  const { disease, confidence } = classifyFromStats(
    greenRatio,
    brownRatio,
    yellowRatio,
    darkRatio,
    lesionScore
  )

  const isBn = language === 'bn'
  const roundedConfidence = Math.round(Math.min(97, Math.max(52, confidence)) * 10) / 10

  const solutionText = isBn
    ? SOLUTIONS_BN[disease] ?? 'একজন কৃষি বিশেষজ্ঞের পরামর্শ নিন।'
    : SOLUTIONS_EN[disease] ?? 'Consult an agricultural specialist.'

  return {
    crop: isBn ? 'ধান' : 'Rice',
    disease: isBn ? DISEASE_BN[disease] ?? disease : disease,
    confidence: roundedConfidence,
    solution: solutionText,
    description: solutionText,
  }
}
