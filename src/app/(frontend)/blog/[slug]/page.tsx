import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { blogStore } from '@/lib/fileStore';
import { formatDateTimeAttribute, formatPublicationDate } from '@/lib/dateUtils';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const posts = await blogStore.getAll();
    const post = posts.find(p => p.slug === slug && p.status === 'published');
    if (!post) return {};
    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || undefined,
      openGraph: {
        title: post.ogTitle || post.metaTitle || post.title,
        description: post.ogDesc || post.metaDesc || post.excerpt || undefined,
        images: post.ogImage ? [post.ogImage] : post.featuredImage ? [post.featuredImage] : undefined,
      },
      alternates: post.canonical ? { canonical: post.canonical } : undefined,
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const posts = await blogStore.getAll();
  const post = posts.find(p => p.slug === slug && p.status === 'published');
  if (!post) notFound();

  return (
    <div className="bg-slate-50/70 py-14 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">{post.title}</span>
        </nav>
        <p className="mb-6 text-sm text-slate-500">
          Publié le{' '}
          <time dateTime={formatDateTimeAttribute(post.createdAt)}>
            {formatPublicationDate(post.createdAt)}
          </time>{' '}
          ·{' '}
          <Link href={`/blog/${post.slug}`} className="text-blue-700 hover:text-blue-800">
            /blog/{post.slug}
          </Link>
        </p>

        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
              className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
          />
        )}

          <header className="mb-8 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{post.title}</h1>
          {post.excerpt && (
              <p className="text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
          )}
          {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.content ? (
          <div
              className="content-rich"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-slate-500 text-sm">This article has no content yet.</p>
        )}
        </article>
      </div>
    </div>
  );
}
