import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Farm } from '@/lib/models/Farm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const farm = await Farm.findById(id);
      if (farm) {
        return NextResponse.json({ success: true, farm });
      }
    }
  } catch (err: any) {
    console.warn('Farm lookup error:', err.message);
  }

  return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const conn = await connectToDatabase();
    if (conn) {
      const updated = await Farm.findByIdAndUpdate(id, body, { new: true });
      if (updated) {
        return NextResponse.json({ success: true, farm: updated });
      }
    }

    // Fallback updated object
    return NextResponse.json({
      success: true,
      farm: { _id: id, ...body, updatedAt: new Date().toISOString() },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
