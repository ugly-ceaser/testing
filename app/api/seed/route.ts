import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();

    // Create default packages
    const packages = [
      {
        name: 'Starter',
        minAmount: 100,
        maxAmount: 999,
        roiPercentage: 12,
        durationDays: 30,
        isActive: true,
      },
      {
        name: 'Professional',
        minAmount: 1000,
        maxAmount: 4999,
        roiPercentage: 15,
        durationDays: 30,
        isActive: true,
      },
      {
        name: 'Premium',
        minAmount: 5000,
        maxAmount: 19999,
        roiPercentage: 20,
        durationDays: 30,
        isActive: true,
      },
      {
        name: 'Elite',
        minAmount: 20000,
        maxAmount: 100000,
        roiPercentage: 30,
        durationDays: 30,
        isActive: true,
      },
    ];

    // Clear existing packages
    await Package.deleteMany({});
    
    // Insert new packages
    await Package.insertMany(packages);

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@Automated AI trades.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Admin User',
        email: 'admin@Automated AI trades.com',
        password: hashedPassword,
        role: 'admin',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        balance: 0,
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}