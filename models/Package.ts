import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  roiPercentage: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Package || mongoose.model<IPackage>('Package', PackageSchema);