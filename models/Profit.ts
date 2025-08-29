import mongoose, { Document, Schema } from 'mongoose';

export interface IProfit extends Document {
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  depositId: mongoose.Types.ObjectId;
  amount: number;
  txHash: string;
  date: Date;
  createdAt: Date;
}

const ProfitSchema = new Schema<IProfit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  depositId: { type: Schema.Types.ObjectId, ref: 'Deposit', required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.models.Profit || mongoose.model<IProfit>('Profit', ProfitSchema);