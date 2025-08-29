import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET: Fetch profile details for logged-in user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress || '',
  });
}

// PUT: Update profile details (name, wallet address)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { name, walletAddress } = await request.json();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const oldName = user.name;
  const oldWallet = user.walletAddress;
  if (name) user.name = name;
  if (walletAddress) user.walletAddress = walletAddress;
  await user.save();
  // Send profile change confirmation email
  const { sendMail } = await import('@/lib/mailer');
  const { getEmailTemplate } = await import('@/lib/emailTemplate');
  await sendMail({
    to: user.email,
    subject: 'Profile Updated',
    html: getEmailTemplate({
      subject: 'Profile Updated',
      message: `Hi ${user.name},<br/>Your profile details have been updated.<br/><ul><li>Name: ${oldName} → ${user.name}</li><li>Wallet Address: ${oldWallet} → ${user.walletAddress}</li></ul>`
    })
  });
  return NextResponse.json({ success: true });
}

// PATCH: Change password
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { oldPassword, newPassword } = await request.json();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return NextResponse.json({ success: true });
}
