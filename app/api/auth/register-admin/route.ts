import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST: Register a new admin (protected by secret)
export async function POST(request: NextRequest) {
  const { name, email, password, walletAddress, secret } = await request.json();
  if (!name || !email || !password || !walletAddress || !secret) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (secret !== process.env.ADMIN_REG_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    walletAddress,
    role: 'admin',
    emailVerified: true,
  });
  return NextResponse.json({ success: true, userId: user._id });
}
