import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Budget } from '@/lib/db/models/Budget';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({ userId: session.userId, month }).lean();
    return NextResponse.json({ budgets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, limit, month } = await req.json();
    if (!category || !limit) {
      return NextResponse.json({ error: 'category and limit are required' }, { status: 400 });
    }

    await connectToDatabase();
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    const budget = await Budget.findOneAndUpdate(
      { userId: session.userId, category, month: currentMonth },
      { limit: parseFloat(limit) },
      { upsert: true, new: true }
    );

    return NextResponse.json({ budget });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 });
  }
}
