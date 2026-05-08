import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, ICO' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
  }

  // Use the MIME-derived extension to avoid extension spoofing; strip path separators entirely
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const blobPath = `uploads/${fileName}`;

  // Use Vercel Blob in production, local filesystem in development
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(blobPath, file, { access: 'public' });
    return NextResponse.json({ url: blob.url });
  }

  // Development fallback: write to public/uploads/
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}` });
}
