import { NextResponse } from 'next/server';
import { blogStore, type BlogPost } from '@/lib/fileStore';

export async function GET() {
  const posts = await blogStore.getAll();
  const now = Date.now();
  const published = posts.filter((p: BlogPost) => {
    if (p.status !== 'published') return false;
    const publicationDate = new Date(p.createdAt).getTime();
    return !Number.isNaN(publicationDate) && publicationDate <= now;
  });
  return NextResponse.json(published);
}
