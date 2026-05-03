import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { pagesStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { slug } = await params;
  const page = await pagesStore.findBySlug(slug);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { slug } = await params;

  const body = await req.json();
  const page = await pagesStore.upsert(slug, body);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'pages', `Updated page: ${slug}`);
  return NextResponse.json(page);
}
