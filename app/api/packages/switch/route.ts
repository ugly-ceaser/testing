import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Package from '@/models/Package';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { packageId } = await request.json();
  if (!packageId) {
    return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
  }
  const user = await User.findById(session.user.id);
  const pkg = await Package.findById(packageId);
  if (!user || !pkg) {
    return NextResponse.json({ error: 'User or package not found' }, { status: 404 });
  }
  if (user.balance < pkg.minAmount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }
  // Switch active package
  user.activePackage = pkg._id;
  await user.save();
  return NextResponse.json({ success: true, activePackageId: pkg._id });
}
