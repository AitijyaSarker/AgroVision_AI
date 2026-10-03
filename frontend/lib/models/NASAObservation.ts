import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INASAObservation extends Document {
  farmId: string;
  latitude: number;
  longitude: number;
  source: string; // 'NASA POWER' | 'NASA GPM IMERG' | 'NASA SMAP' | 'NASA HLS' | 'NASA GIBS'
  parameter: string; // 'T2M' | 'PRECTOTCORR' | 'GWETTOP' | 'GWETROOT' | 'NDVI'
  value: number;
  unit: string;
  spatialResolution: string;
  quality: 'verified' | 'provisional' | 'modeled' | 'cached' | 'demo';
  dataTimestamp: Date;
  fetchedAt: Date;
  expiresAt: Date;
}

const NASAObservationSchema = new Schema<INASAObservation>(
  {
    farmId: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    source: { type: String, required: true },
    parameter: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: '' },
    spatialResolution: { type: String, default: '0.5 x 0.5 deg (~50 km)' },
    quality: {
      type: String,
      enum: ['verified', 'provisional', 'modeled', 'cached', 'demo'],
      default: 'verified',
    },
    dataTimestamp: { type: Date, default: Date.now },
    fetchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

// Compound index for fast farm + parameter lookups
NASAObservationSchema.index({ farmId: 1, parameter: 1 });

export const NASAObservation: Model<INASAObservation> =
  mongoose.models.NASAObservation ||
  mongoose.model<INASAObservation>('NASAObservation', NASAObservationSchema);

export default NASAObservation;
