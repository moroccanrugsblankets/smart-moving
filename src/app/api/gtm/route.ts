import { NextResponse } from 'next/server';
import { settingsStore } from '@/lib/fileStore';

export async function GET() {
  try {
    const settings = await settingsStore.get();
    const gtmId = (settings.gtmId ?? '').replace(/[^A-Za-z0-9-]/g, '').trim();
    return NextResponse.json({ gtmId });
  } catch {
    return NextResponse.json({ gtmId: '' });
  }
}
