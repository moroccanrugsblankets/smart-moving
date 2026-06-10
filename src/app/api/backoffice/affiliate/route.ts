import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { settingsStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const settings = await settingsStore.get();
  return NextResponse.json({ affiliatePhone: settings.affiliatePhone ?? '1-844-578-3057' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { affiliatePhone } = await req.json();
  const settings = await settingsStore.get();
  await settingsStore.save({ ...settings, affiliatePhone: affiliatePhone ?? settings.affiliatePhone });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'affiliate', 'Updated affiliate phone number');
  return NextResponse.json({ ok: true });
}
