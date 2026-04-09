import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, monthlyIncome, currency, riskProfile } = await req.json();

    if (!name || !email || !password || monthlyIncome === undefined) {
      return NextResponse.json({ error: 'Name, email, password, and monthly income are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      monthlyIncome: parseFloat(monthlyIncome),
      currency: currency || 'INR',
      riskProfile: riskProfile || 'moderate',
    });

    await createSession(user._id.toString(), user.email, user.name);

    return NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, monthlyIncome: user.monthlyIncome },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
