import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { activityLogsStore } from '@/lib/fileStore';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(activityLogsStore.getAll());
}
