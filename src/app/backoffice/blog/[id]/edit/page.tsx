'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BlogForm from '../../BlogForm';

interface PostPreviewData {
  slug?: string;
  status?: 'draft' | 'published';
}

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/backoffice/blog/${id}`)
      .then(r => r.json())
      .then(data => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!post) return <div className="text-red-400 p-8">Post not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
        <Link
          href={`/blog/${post.slug ?? ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-2 text-xs font-medium rounded ${(post.status === 'published' && post.slug) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-600 text-slate-300 cursor-not-allowed pointer-events-none'}`}
          title={post.status === 'published' ? 'Open preview in new tab' : 'Preview available when post is published'}
        >
          Preview
        </Link>
      </div>
      <BlogForm initialData={post} postId={id} />
    </div>
  );
}
