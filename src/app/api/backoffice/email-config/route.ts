import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailConfigStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const config = await emailConfigStore.get();
  // Never return the actual password over the wire; use a boolean flag instead
  const { password, ...rest } = config;
  return NextResponse.json({ ...rest, passwordSet: Boolean(password) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const existing = await emailConfigStore.get();
  // Only update password when a new non-empty value is explicitly provided
  const password = typeof body.newPassword === 'string' && body.newPassword.length > 0
    ? body.newPassword
    : existing.password;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { newPassword, passwordSet, ...fields } = body;
  await emailConfigStore.save({ ...fields, password });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'email-config', 'Updated SMTP config');
  return NextResponse.json({ ok: true });
}
