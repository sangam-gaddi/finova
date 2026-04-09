import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Transaction } from '@/lib/db/models/Transaction';
import { Budget } from '@/lib/db/models/Budget';
import { User } from '@/lib/db/models/User';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(session.userId).select('monthlyIncome');
    const monthlyIncome = user?.monthlyIncome || 0;

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Category breakdown (this month, expenses)
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId: session.userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Weekly spending (last 7 weeks)
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    const weeklySpending = await Transaction.aggregate([
      { $match: { userId: session.userId, type: 'expense', date: { $gte: sevenWeeksAgo } } },
      {
        $group: {
          _id: { $week: '$date' },
          total: { $sum: '$amount' },
          week: { $first: '$date' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Totals this month
    const monthlyTotals = await Transaction.aggregate([
      { $match: { userId: session.userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const totalIncome = monthlyTotals.find((t) => t._id === 'income')?.total || 0;
    const totalExpenses = monthlyTotals.find((t) => t._id === 'expense')?.total || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

    // Budget adherence
    const currentMonth = now.toISOString().slice(0, 7);
    const budgets = await Budget.find({ userId: session.userId, month: currentMonth }).lean();

    let budgetScore = 100;
    for (const budget of budgets) {
      const spent = categoryBreakdown.find((c) => c._id === budget.category)?.total || 0;
      if (spent > budget.limit) budgetScore -= 15;
      else if (spent > budget.limit * 0.9) budgetScore -= 5;
    }

    // Health Score (0-100)
    let healthScore = 0;
    if (savingsRate >= 20) healthScore += 40;
    else if (savingsRate >= 10) healthScore += 20;
    else if (savingsRate > 0) healthScore += 10;
    healthScore += Math.max(0, Math.min(40, budgetScore * 0.4));
    if (monthlyIncome > 0) healthScore += 20;
    healthScore = Math.round(Math.min(100, Math.max(0, healthScore)));

    // Mood breakdown
    const moodBreakdown = await Transaction.aggregate([
      { $match: { userId: session.userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$mood', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 10) / 10,
        healthScore,
        healthStatus: healthScore >= 70 ? 'green' : healthScore >= 40 ? 'amber' : 'red',
        monthlyIncome,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        name: c._id,
        value: c.total,
        count: c.count,
      })),
      weeklySpending: weeklySpending.map((w) => ({
        week: w._id,
        amount: w.total,
        date: w.week,
      })),
      moodBreakdown: moodBreakdown.map((m) => ({
        mood: m._id,
        total: m.total,
        count: m.count,
      })),
      budgets,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
