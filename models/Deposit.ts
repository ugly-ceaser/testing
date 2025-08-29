import mongoose, { Document, Schema } from 'mongoose';

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  amount: number;
  txHash: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.models.Deposit || mongoose.model<IDeposit>('Deposit', DepositSchema);