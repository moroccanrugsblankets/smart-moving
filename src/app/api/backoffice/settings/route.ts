import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { settingsStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(settingsStore.get());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  settingsStore.save(body);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'settings', 'Updated general settings');
  return NextResponse.json({ ok: true });
}
