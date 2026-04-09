import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Transaction } from '@/lib/db/models/Transaction';
import mongoose from 'mongoose';

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Safely unwrap params for NextJS version compatibility
    const paramsObj = await Promise.resolve(context.params);
    const id = paramsObj?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Ensure they only delete their own transaction
    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Transaction not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
