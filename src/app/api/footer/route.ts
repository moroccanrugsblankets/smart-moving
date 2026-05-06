import { NextResponse } from 'next/server';
import { pagesStore, footerSettingsStore } from '@/lib/fileStore';

export async function GET() {
  const [pages, footerSettings] = await Promise.all([
    pagesStore.getAll(),
    footerSettingsStore.get(),
  ]);

  const footerPages = pages
    .filter(p => p.showInFooter)
    .sort((a, b) => a.footerOrder - b.footerOrder)
    .map(p => ({ slug: p.slug, title: p.title }));

  return NextResponse.json({ pages: footerPages, ...footerSettings });
}
