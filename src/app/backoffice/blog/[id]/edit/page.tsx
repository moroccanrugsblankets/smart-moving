'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BlogForm from '../../BlogForm';

interface PostPreviewData {
  slug?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
}

function isFuturePublicationDate(iso?: string) {
  if (!iso) return false;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
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
  const canPreview = post.status === 'published' && !!post.slug && !isFuturePublicationDate(post.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
        {canPreview ? (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white"
            title="Open preview in new tab"
          >
            Preview
          </Link>
        ) : (
          <span
            className="px-3 py-2 text-xs font-medium rounded bg-slate-600 text-slate-300 cursor-not-allowed"
            title="Preview available when post is published and has a slug"
          >
            Preview
          </span>
        )}
      </div>
      <BlogForm initialData={post} postId={id} />
    </div>
  );
}
