import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import { z } from 'zod';

const packageUpdateSchema = z.object({
  name: z.string().min(1, 'Package name is required').optional(),
  minAmount: z.number().min(1, 'Minimum amount must be greater than 0').optional(),
  maxAmount: z.number().min(1, 'Maximum amount must be greater than 0').optional(),
  roiPercentage: z.number().min(0.01, 'ROI percentage must be greater than 0').optional(),
  durationDays: z.number().min(1, 'Duration must be at least 1 day').optional(),
  isActive: z.boolean().optional(),
});

// PUT - Update package (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = packageUpdateSchema.parse(body);

    // Validate that minAmount is less than maxAmount if both are provided
    if (validatedData.minAmount && validatedData.maxAmount) {
      if (validatedData.minAmount >= validatedData.maxAmount) {
        return NextResponse.json(
          { error: 'Minimum amount must be less than maximum amount' },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const packageId = params.id;
    
    // Check if package exists
    const existingPackage = await Package.findById(packageId);
    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // If updating name, check if new name already exists
    if (validatedData.name && validatedData.name !== existingPackage.name) {
      const nameExists = await Package.findOne({ 
        name: validatedData.name,
        _id: { $ne: packageId }
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Package name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      validatedData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete package (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const packageId = params.id;
    
    // Check if package exists
    const existingPackage = await Package.findById(packageId);
    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // TODO: Check if package has active deposits before deletion
    // For now, we'll allow deletion but in production you might want to prevent this

    await Package.findByIdAndDelete(packageId);
    
    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}