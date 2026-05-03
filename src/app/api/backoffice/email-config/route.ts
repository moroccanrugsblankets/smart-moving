import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailConfigStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

// Sentinel used to indicate "password unchanged" from client — must not be a valid password
const PASSWORD_UNCHANGED_SENTINEL = '__UNCHANGED_PASSWORD_SENTINEL__';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const config = emailConfigStore.get();
  // Return sentinel instead of actual password so it is never sent over the wire
  return NextResponse.json({ ...config, password: config.password ? PASSWORD_UNCHANGED_SENTINEL : '' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const existing = emailConfigStore.get();
  // If client echoes back the sentinel, keep the existing password
  const password = body.password === PASSWORD_UNCHANGED_SENTINEL ? existing.password : body.password;
  emailConfigStore.save({ ...body, password });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'email-config', 'Updated SMTP config');
  return NextResponse.json({ ok: true });
}
