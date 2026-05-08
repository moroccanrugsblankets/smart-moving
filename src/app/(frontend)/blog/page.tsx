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
    <div className="bg-slate-50/70 py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10 md:mb-14">
          <p className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold tracking-wide uppercase">Insights</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4">Blog</h1>
          <p className="text-slate-600 mt-3 max-w-2xl">
            Guides and advice to plan your move with more confidence.
          </p>
        </div>
      {published.length === 0 ? (
          <p className="text-slate-500">No articles published yet.</p>
      ) : (
          <div className="grid gap-6 md:gap-8">
          {published.map(post => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                    className="w-full h-52 object-cover rounded-xl mb-5"
                />
              )}
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                  <p className="text-slate-600 leading-relaxed mb-4">{post.excerpt}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-blue-700 text-sm font-semibold hover:text-blue-800"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
