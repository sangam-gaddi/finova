import mongoose, { Schema, model, models, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password: string;
  monthlyIncome: number;
  currency: string;
  riskProfile: 'low' | 'moderate' | 'high';
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    monthlyIncome: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    riskProfile: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
