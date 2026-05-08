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
    <div className="bg-slate-50/70 py-14 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">{page.title}</h1>
          {page.content ? (
            <div
              className="content-rich"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-slate-500 text-sm">This page has no content yet.</p>
          )}
        </article>
      </div>
    </div>
  );
}
