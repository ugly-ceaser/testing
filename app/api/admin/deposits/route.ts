import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Deposit from '@/models/Deposit';
import User from '@/models/User';

// GET: List all deposits
export async function GET(request: NextRequest) {
  await dbConnect();
  const deposits = await Deposit.find({}).populate('userId').populate('packageId').sort({ createdAt: -1 });
  return NextResponse.json(deposits);
}

// PATCH: Approve or decline a deposit
export async function PATCH(request: NextRequest) {
  await dbConnect();
  const { depositId, status } = await request.json();
  const deposit = await Deposit.findById(depositId);
  if (!deposit) {
    return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
  }
  deposit.status = status;
  await deposit.save();
  // If approved, update investor balance and send confirmation email
  if (status === 'approved') {
    const user = await User.findById(deposit.userId);
    if (user) {
      user.balance += deposit.amount;
      await user.save();
      // Send deposit confirmation email
      const { sendMail } = await import('@/lib/mailer');
      const { getEmailTemplate } = await import('@/lib/emailTemplate');
      await sendMail({
        to: user.email,
        subject: 'Deposit Approved',
        html: getEmailTemplate({
          subject: 'Deposit Approved',
          message: `Dear ${user.name},<br/>Your deposit of <b>${deposit.amount}</b> has been approved and credited to your account.<br/>Transaction Hash: ${deposit.txHash}<br/>Thank you for investing with us!`
        })
      });
    }
  }
  return NextResponse.json({ success: true, status });
}
