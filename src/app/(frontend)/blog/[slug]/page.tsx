import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { blogStore } from '@/lib/fileStore';

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
    <div className="max-w-3xl mx-auto px-4 py-16">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">{post.title}</span>
      </nav>

      <article>
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.content ? (
          <div
            className="prose prose-slate max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-slate-500 text-sm">This article has no content yet.</p>
        )}
      </article>
    </div>
  );
}
