import { NextRequest, NextResponse } from 'next/server';
import { calculateMoving, calculateCleaning } from '@/lib/calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, ...input } = body;

    if (serviceType === 'moving') {
      return NextResponse.json({ success: true, estimate: await calculateMoving(input) });
    }
    if (serviceType === 'cleaning') {
      return NextResponse.json({ success: true, estimate: await calculateCleaning(input) });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid serviceType' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
