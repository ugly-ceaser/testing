import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Deposit from '@/models/Deposit';
import Withdrawal from '@/models/Withdrawal';
import Profit from '@/models/Profit';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await dbConnect();

  // Total deposits (approved)
  const depositsResult = await Deposit.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDeposits = depositsResult[0]?.total || 0;

  // Total withdrawals (approved)
  const withdrawalsResult = await Withdrawal.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalWithdrawals = withdrawalsResult[0]?.total || 0;

  // Total profits
  const profitsResult = await Profit.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalProfits = profitsResult[0]?.total || 0;

  // Total users
  const totalUsers = await User.countDocuments();

  return NextResponse.json({
    totalDeposits,
    totalWithdrawals,
    totalProfits,
    totalUsers,
  });
}
