import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  walletAddress: z.string().min(10, 'Invalid wallet address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, walletAddress } = registerSchema.parse(body);

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      walletAddress,
      role: 'investor',
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationTokenExpires: tokenExpires,
    });

    // Send verification email
    const { sendMail } = await import('@/lib/mailer');
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const { getEmailTemplate } = await import('@/lib/emailTemplate');
    await sendMail({
      to: email,
      subject: 'Verify your email',
      html: getEmailTemplate({
        subject: 'Verify your email',
        message: `Welcome, ${name}!<br/>Please verify your email by clicking the link below:<br/><a href="${verifyUrl}">Verify Email</a>`
      })
    });

    return NextResponse.json(
      { message: 'User created successfully. Please check your email to verify your account.', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}