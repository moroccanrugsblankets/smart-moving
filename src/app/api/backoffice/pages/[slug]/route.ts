import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { pagesStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { slug } = await params;
  const page = pagesStore.findBySlug(slug);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { slug } = await params;

  const pages = pagesStore.getAll();
  const idx = pages.findIndex(p => p.slug === slug);
  const body = await req.json();

  if (idx === -1) {
    const newPage = { ...body, slug, updatedAt: new Date().toISOString() };
    pages.push(newPage);
    pagesStore.save(pages);
    return NextResponse.json(newPage, { status: 201 });
  }

  pages[idx] = { ...pages[idx], ...body, slug, updatedAt: new Date().toISOString() };
  pagesStore.save(pages);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'pages', `Updated page: ${slug}`);
  return NextResponse.json(pages[idx]);
}
