import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit from '@/models/Profit';
import Package from '@/models/Package';
import User from '@/models/User';
import Deposit from '@/models/Deposit';
import Withdrawal from '@/models/Withdrawal';

// GET: Reports overview (profits, ROI payouts, active packages)
export async function GET(request: NextRequest) {
  await dbConnect();
  // Profits overview
  const totalProfits = await Profit.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  // ROI payouts (count of profit entries)
  const roiPayouts = await Profit.countDocuments();
  // Active packages
  const activePackages = await Package.find({ isActive: true });
  return NextResponse.json({
    totalProfits: totalProfits[0]?.total || 0,
    roiPayouts,
    activePackages,
  });
}

// POST: Credit profit to investor
export async function POST(request: NextRequest) {
  await dbConnect();
  const { userId, amount, description } = await request.json();
  if (!userId || !amount) {
    return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
  }
  const profit = await Profit.create({ user: userId, amount, description });
  return NextResponse.json(profit);
}

// PATCH: Deposit for investor
export async function PATCH(request: NextRequest) {
  await dbConnect();
  const { userId, amount, packageId, transactionHash } = await request.json();
  if (!userId || !amount || !packageId || !transactionHash) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Create deposit and approve immediately
  const deposit = await Deposit.create({
    user: userId,
    package: packageId,
    amount,
    transactionHash,
    status: 'approved',
  });
  // Update user balance
  const user = await User.findById(userId);
  if (user) {
    user.balance += amount;
    await user.save();
  }
  return NextResponse.json(deposit);
}

// DELETE: Delete investor and all transactions
export async function DELETE(request: NextRequest) {
  await dbConnect();
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  await Profit.deleteMany({ user: userId });
  await Deposit.deleteMany({ user: userId });
  await Withdrawal.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
  return NextResponse.json({ success: true });
}
