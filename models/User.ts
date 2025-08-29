import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  name: string;
  email: string;
  password: string;
  role: 'investor' | 'admin';
  walletAddress: string;
  balance: number;
  isBlocked: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}


const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['investor', 'admin'], default: 'investor' },
  walletAddress: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpires: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);