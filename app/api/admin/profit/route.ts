import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profit from '@/models/Profit';

export async function POST(req: Request) {
  await dbConnect();
  const { userId, amount, packageId, depositId } = await req.json();
  if (!userId || !amount || !packageId || !depositId) {
    return NextResponse.json({ error: 'Missing userId, amount, packageId, or depositId' }, { status: 400 });
  }
  const profit = await Profit.create({
    userId,
    packageId,
    depositId,
    amount: Number(amount),
    txHash: 'admin-manual'
  });
  return NextResponse.json({ success: true, profit });
}
