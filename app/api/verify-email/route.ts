import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// GET: Verify email using token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (user.emailVerificationTokenExpires < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save();
  return NextResponse.json({ success: true, message: 'Email verified successfully.' });
}
