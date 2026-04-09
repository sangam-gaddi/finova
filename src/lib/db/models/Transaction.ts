import mongoose, { Schema, model, models } from 'mongoose';

export type TransactionCategory =
  | 'Food' | 'Transport' | 'Shopping' | 'Utilities' | 'Entertainment'
  | 'Health' | 'Education' | 'Rent' | 'Investment' | 'Income' | 'Other';

export type TransactionMood = 'needed' | 'neutral' | 'impulse';

export interface ITransaction {
  _id: string;
  userId: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  mood: TransactionMood;
  aiNote?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      required: true,
    },
    description: { type: String, required: false, trim: true },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], required: true },
    mood: { type: String, enum: ['needed', 'neutral', 'impulse'], default: 'neutral' },
    aiNote: { type: String },
  },
  { timestamps: true }
);

export const Transaction = (models.Transaction as mongoose.Model<ITransaction>) || model<ITransaction>('Transaction', TransactionSchema);
