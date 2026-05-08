import Link from 'next/link';
import type { Metadata } from 'next';
import { blogStore } from '@/lib/fileStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogListPage() {
  const posts = await blogStore.getAll();
  const published = posts.filter(p => p.status === 'published');

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-10">Blog</h1>
      {published.length === 0 ? (
        <p className="text-slate-500">No articles published yet.</p>
      ) : (
        <div className="space-y-8">
          {published.map(post => (
            <article key={post.id} className="border-b border-slate-200 pb-8 last:border-0">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{post.excerpt}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
