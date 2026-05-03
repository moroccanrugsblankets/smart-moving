import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { blogStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(blogStore.getAll());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const posts = blogStore.getAll();
  const newPost = {
    ...body,
    id: crypto.randomUUID(),
    authorId: auth.session.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  blogStore.save(posts);
  logActivity(auth.session.user.id, auth.session.user.email, 'CREATE', 'blog', `Created post: ${newPost.title}`);
  return NextResponse.json(newPost, { status: 201 });
}
