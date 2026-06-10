import { NextResponse } from 'next/server';
import { settingsStore } from '@/lib/fileStore';

export async function GET() {
  try {
    const settings = await settingsStore.get();
    return NextResponse.json({ affiliatePhone: settings.affiliatePhone ?? '1-844-578-3057' });
  } catch {
    return NextResponse.json({ affiliatePhone: '1-844-578-3057' });
  }
}
