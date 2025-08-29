import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';

export async function GET() {
  try {
    await dbConnect();
    
    const packages = await Package.find({ isActive: true }).sort({ minAmount: 1 });
    // Map all required fields for frontend compatibility
    const mapped = packages.map(pkg => ({
      _id: pkg._id,
      name: pkg.name,
      minAmount: pkg.minAmount,
      maxAmount: pkg.maxAmount,
      roiPercentage: pkg.roiPercentage,
      durationDays: pkg.durationDays,
      isActive: pkg.isActive,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}