import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { blogStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const post = blogStore.findById(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const posts = blogStore.getAll();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  posts[idx] = { ...posts[idx], ...body, id, updatedAt: new Date().toISOString() };
  blogStore.save(posts);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'blog', `Updated post: ${posts[idx].title}`);
  return NextResponse.json(posts[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const posts = blogStore.getAll().filter(p => p.id !== id);
  blogStore.save(posts);
  logActivity(auth.session.user.id, auth.session.user.email, 'DELETE', 'blog', `Deleted post id: ${id}`);
  return NextResponse.json({ ok: true });
}
