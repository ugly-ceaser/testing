import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Profit from '@/models/Profit';

// GET: Fetch all profits for the logged-in user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }
  await dbConnect();
  const profits = await Profit.find({ user: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(profits);
}
