import { Schema, model, models } from 'mongoose';

export interface IBudget {
  _id: string;
  userId: string;
  category: string;
  limit: number;
  month: string; // "2026-04" format
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: String, required: true }, // YYYY-MM
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export const Budget = models.Budget || model<IBudget>('Budget', BudgetSchema);
