'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '../../BlogForm';

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState(null);
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
      <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
      <BlogForm initialData={post} postId={id} />
    </div>
  );
}
