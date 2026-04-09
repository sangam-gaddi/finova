import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Transaction } from '@/lib/db/models/Transaction';
import { Budget } from '@/lib/db/models/Budget';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const transactions = await Transaction.find({ userId: session.userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ userId: session.userId });

    return NextResponse.json({ transactions, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { amount, category, description, date, type, mood, aiNote } = body;

    if (!amount || !category || !description || !type) {
      return NextResponse.json({ error: 'amount, category, description, and type are required' }, { status: 400 });
    }

    await connectToDatabase();

    const transaction = await Transaction.create({
      userId: session.userId,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
      type,
      mood: mood || 'neutral',
      aiNote,
    });

    // --- Budget Alert Check ---
    if (type === 'expense') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budget = await Budget.findOne({ userId: session.userId, category, month: currentMonth });

      if (budget) {
        const startOfMonth = new Date(`${currentMonth}-01`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const aggregate = await Transaction.aggregate([
          { $match: { userId: session.userId, category, type: 'expense', date: { $gte: startOfMonth, $lt: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const spent = aggregate[0]?.total || 0;
        const utilization = spent / budget.limit;

        if (utilization >= 0.8) {
          return NextResponse.json({
            transaction,
            budgetAlert: {
              category,
              spent,
              limit: budget.limit,
              utilization: Math.round(utilization * 100),
            },
          });
        }
      }
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Transaction POST error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
