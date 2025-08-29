import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST: Request password reset
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // Generate new password
  const newPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();
  // Send new password email
  const { sendMail } = await import('@/lib/mailer');
  const { getEmailTemplate } = await import('@/lib/emailTemplate');
  await sendMail({
    to: email,
    subject: 'Your New Password',
    html: getEmailTemplate({
      subject: 'Your New Password',
      message: `Hi ${user.name},<br/>Your password has been reset. Here is your new password:<br/><b>${newPassword}</b><br/>Please log in and change your password immediately.`
    })
  });
  return NextResponse.json({ success: true, message: 'A new password has been sent to your email.' });
}

// PATCH: Reset password
export async function PATCH(request: NextRequest) {
  const { token, newPassword } = await request.json();
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Missing token or new password' }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ passwordResetToken: token });
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (user.passwordResetTokenExpires < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  return NextResponse.json({ success: true, message: 'Password has been reset.' });
}
