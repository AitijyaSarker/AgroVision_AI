import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFarm extends Document {
  userId: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  boundary?: [number, number][]; // Polygon coordinates
  area: number;
  areaUnit: 'decimal' | 'bigha' | 'acre' | 'hectare';
  currentCrop: string;
  previousCrop: string;
  season: 'Kharif-1' | 'Kharif-2' | 'Rabi' | 'All-Season';
  soilType: 'alluvial' | 'clay' | 'sandy_loam' | 'silt_loam' | 'peat' | 'unknown';
  irrigation: 'full' | 'partial' | 'rainfed' | 'none';
  waterSource: 'groundwater' | 'canal' | 'pond' | 'rainwater' | 'none';
  priorities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    locationName: { type: String, default: 'Sylhet, Bangladesh' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    boundary: { type: [[Number]], default: [] },
    area: { type: Number, default: 33 }, // 33 decimals = ~1 bigha
    areaUnit: {
      type: String,
      enum: ['decimal', 'bigha', 'acre', 'hectare'],
      default: 'decimal',
    },
    currentCrop: { type: String, default: 'Aman Rice' },
    previousCrop: { type: String, default: 'Aus Rice' },
    season: {
      type: String,
      enum: ['Kharif-1', 'Kharif-2', 'Rabi', 'All-Season'],
      default: 'Rabi',
    },
    soilType: {
      type: String,
      enum: ['alluvial', 'clay', 'sandy_loam', 'silt_loam', 'peat', 'unknown'],
      default: 'alluvial',
    },
    irrigation: {
      type: String,
      enum: ['full', 'partial', 'rainfed', 'none'],
      default: 'partial',
    },
    waterSource: {
      type: String,
      enum: ['groundwater', 'canal', 'pond', 'rainwater', 'none'],
      default: 'groundwater',
    },
    priorities: {
      type: [String],
      default: ['soil_health', 'climate_resilience'],
    },
  },
  { timestamps: true }
);

export const Farm: Model<IFarm> =
  mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);

export default Farm;
