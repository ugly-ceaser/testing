import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getEmailTemplate } from '@/lib/emailTemplate';

// POST: Admin send custom email to user
export async function POST(req: Request) {
  const { email, subject, message } = await req.json();
  if (!email || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const { sendMail } = await import('@/lib/mailer');
  const html = getEmailTemplate({ subject, message });
  await sendMail({
    to: user.email,
    subject,
    html,
  });
  return NextResponse.json({ success: true });
}
