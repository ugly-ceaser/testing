import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Deposit from '@/models/Deposit';
import Withdrawal from '@/models/Withdrawal';
import Profit from '@/models/Profit';
import Package from '@/models/Package';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;

    // Get user balance
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get total deposits (approved only)
    const totalDepositsResult = await Deposit.aggregate([
      { $match: { userId: userId, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeposits = totalDepositsResult[0]?.total || 0;

    // Get total withdrawals (approved only)
    const totalWithdrawalsResult = await Withdrawal.aggregate([
      { $match: { userId: userId, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = totalWithdrawalsResult[0]?.total || 0;

    // Get total profits
    const totalProfitsResult = await Profit.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalProfits = totalProfitsResult[0]?.total || 0;

    // Get active package (most recent approved deposit)
    const activeDeposit = await Deposit.findOne({
      userId: userId,
      status: 'approved'
    }).populate('packageId').sort({ createdAt: -1 });

    const activePackage = activeDeposit?.packageId?.name || null;

    return NextResponse.json({
      balance: user.balance,
      totalDeposits,
      totalWithdrawals,
      totalProfits,
      activePackage,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}