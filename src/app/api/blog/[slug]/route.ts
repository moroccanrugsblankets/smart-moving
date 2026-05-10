import { NextRequest, NextResponse } from 'next/server';
import { blogStore, type BlogPost } from '@/lib/fileStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const posts = await blogStore.getAll();
  const now = Date.now();
  const post = posts.find(
    (p: BlogPost) => {
      if (p.slug !== slug || p.status !== 'published') return false;
      const publicationDate = new Date(p.createdAt).getTime();
      return !Number.isNaN(publicationDate) && publicationDate <= now;
    }
  );
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}
