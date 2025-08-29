import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// GET: List all users
export async function GET(request: NextRequest) {
  await dbConnect();
  const users = await User.find({}, 'name email walletAddress isBlocked createdAt');
  return NextResponse.json(users);
}

// PATCH: Block or unblock a user
export async function PATCH(request: NextRequest) {
  await dbConnect();
  const { userId, block } = await request.json();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  user.isBlocked = !!block;
  await user.save();
  return NextResponse.json({ success: true, isBlocked: user.isBlocked });
}

// DELETE: Delete a user and all their transactions
export async function DELETE(request: NextRequest) {
  await dbConnect();
  const { userId } = await request.json();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  await user.deleteOne();
  // Optionally, delete related transactions (deposits, withdrawals, profits)
  // ...existing code for deleting related transactions...
  return NextResponse.json({ success: true });
}
