import { NextResponse } from 'next/server';
import { blogStore, type BlogPost } from '@/lib/fileStore';

export async function GET() {
  const posts = await blogStore.getAll();
  const published = posts.filter((p: BlogPost) => p.status === 'published');
  return NextResponse.json(published);
}
