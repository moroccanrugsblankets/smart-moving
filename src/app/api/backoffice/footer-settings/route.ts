import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { footerSettingsStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await footerSettingsStore.get());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  await footerSettingsStore.save(body);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'footer-settings', 'Updated footer settings');
  return NextResponse.json({ ok: true });
}
