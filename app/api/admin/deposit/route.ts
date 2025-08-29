import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Deposit from '@/models/Deposit';

export async function POST(req: Request) {
  await dbConnect();
  const { email, amount, packageId } = await req.json();
  if (!email || !amount || !packageId) {
    return NextResponse.json({ error: 'Missing email, amount, or packageId' }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const deposit = await Deposit.create({
    userId: user._id,
    packageId,
    amount: Number(amount),
    status: 'approved',
    txHash: 'admin-manual'
  });
  return NextResponse.json({ success: true, deposit });
}
