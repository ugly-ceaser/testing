import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Withdrawal from '@/models/Withdrawal';

// GET: Fetch all withdrawals for the logged-in user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }
  await dbConnect();
  const withdrawals = await Withdrawal.find({ user: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(withdrawals);
}

// POST: Create a new withdrawal request
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { amount } = await request.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  // Create withdrawal request
  const withdrawal = await Withdrawal.create({
    user: session.user.id,
    amount,
    status: 'PENDING',
  });
  return NextResponse.json(withdrawal);
}
