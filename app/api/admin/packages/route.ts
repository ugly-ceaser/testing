// PUT - Update package (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { packageId, ...update } = body;
    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }
    await dbConnect();
    const pkg = await Package.findByIdAndUpdate(packageId, update, { new: true });
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json(pkg);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete package (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { packageId } = body;
    if (!packageId) {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }
    await dbConnect();
    const pkg = await Package.findByIdAndDelete(packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import { z } from 'zod';

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  minAmount: z.number().min(1, 'Minimum amount must be greater than 0'),
  maxAmount: z.number().min(1, 'Maximum amount must be greater than 0'),
  roiPercentage: z.number().min(0.01, 'ROI percentage must be greater than 0'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  isActive: z.boolean().optional().default(true),
});

// GET - Fetch all packages (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const packages = await Package.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new package (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = packageSchema.parse(body);

    // Validate that minAmount is less than maxAmount
    if (validatedData.minAmount >= validatedData.maxAmount) {
      return NextResponse.json(
        { error: 'Minimum amount must be less than maximum amount' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if package name already exists
    const existingPackage = await Package.findOne({ name: validatedData.name });
    if (existingPackage) {
      return NextResponse.json(
        { error: 'Package name already exists' },
        { status: 400 }
      );
    }

    const newPackage = await Package.create(validatedData);
    
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}