import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailTemplatesStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const tpl = await emailTemplatesStore.findById(id);
  if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tpl);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const body = await req.json();
  const { subject, htmlContent } = body;

  const tpl = await emailTemplatesStore.findById(id);
  if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await emailTemplatesStore.update(id, { subject, htmlContent });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'email-templates', `Updated template: ${updated.name}`);
  return NextResponse.json(updated);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const body = await req.json();
  if (body.action !== 'restore_default') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const tpl = await emailTemplatesStore.findById(id);
  if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const restored = await emailTemplatesStore.restoreDefault(id);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'email-templates', `Restored default for: ${restored.name}`);
  return NextResponse.json(restored);
}
