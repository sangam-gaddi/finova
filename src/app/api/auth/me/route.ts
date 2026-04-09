import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
