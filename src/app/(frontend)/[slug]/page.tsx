import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { pagesStore } from '@/lib/fileStore';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await pagesStore.findBySlug(slug);
    if (!page) return {};
    return {
      title: page.metaTitle || page.title,
      description: page.metaDesc || undefined,
      openGraph: {
        title: page.ogTitle || page.metaTitle || page.title,
        description: page.ogDesc || page.metaDesc || undefined,
        images: page.ogImage ? [page.ogImage] : undefined,
      },
      alternates: page.canonical ? { canonical: page.canonical } : undefined,
    };
  } catch {
    return {};
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await pagesStore.findBySlug(slug);
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">{page.title}</h1>
      {page.content ? (
        <div
          className="prose prose-slate max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="text-slate-500 text-sm">This page has no content yet.</p>
      )}
    </div>
  );
}
