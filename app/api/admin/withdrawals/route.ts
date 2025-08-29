import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';

// GET: List all withdrawals
export async function GET(request: NextRequest) {
  await dbConnect();
  const withdrawals = await Withdrawal.find({}).populate('user').sort({ createdAt: -1 });
  return NextResponse.json(withdrawals);
}

// PATCH: Approve or decline a withdrawal
export async function PATCH(request: NextRequest) {
  await dbConnect();
  const { withdrawalId, status } = await request.json();
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) {
    return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
  }
  withdrawal.status = status;
  await withdrawal.save();
  // If approved, deduct investor balance and send confirmation email
  if (status === 'approved') {
    const user = await User.findById(withdrawal.userId);
    if (user) {
      user.balance -= withdrawal.amount;
      await user.save();
      // Send withdrawal confirmation email
      const { sendMail } = await import('@/lib/mailer');
      const { getEmailTemplate } = await import('@/lib/emailTemplate');
      await sendMail({
        to: user.email,
        subject: 'Withdrawal Approved',
        html: getEmailTemplate({
          subject: 'Withdrawal Approved',
          message: `Dear ${user.name},<br/>Your withdrawal request of <b>${withdrawal.amount}</b> has been approved and processed.<br/>Thank you for using our platform!`
        })
      });
    }
  }
  return NextResponse.json({ success: true, status });
}
