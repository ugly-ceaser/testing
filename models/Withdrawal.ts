import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);