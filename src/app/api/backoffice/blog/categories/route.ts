import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { blogCategoriesStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(blogCategoriesStore.getAll());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const cats = blogCategoriesStore.getAll();
  const newCat = { id: crypto.randomUUID(), name: body.name, slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-') };
  cats.push(newCat);
  blogCategoriesStore.save(cats);
  logActivity(auth.session.user.id, auth.session.user.email, 'CREATE', 'blog-categories', `Created: ${newCat.name}`);
  return NextResponse.json(newCat, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await req.json();
  const cats = blogCategoriesStore.getAll().filter(c => c.id !== id);
  blogCategoriesStore.save(cats);
  logActivity(auth.session.user.id, auth.session.user.email, 'DELETE', 'blog-categories', `Deleted id: ${id}`);
  return NextResponse.json({ ok: true });
}
