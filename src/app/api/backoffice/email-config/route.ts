import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailConfigStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const config = emailConfigStore.get();
  // Mask password in response
  return NextResponse.json({ ...config, password: config.password ? '••••••••' : '' });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const existing = emailConfigStore.get();
  // If password is masked, keep existing
  const password = body.password === '••••••••' ? existing.password : body.password;
  emailConfigStore.save({ ...body, password });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'email-config', 'Updated SMTP config');
  return NextResponse.json({ ok: true });
}
