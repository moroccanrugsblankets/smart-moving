'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published';
  createdAt: string;
}

function isFuturePublicationDate(iso: string) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filtered, setFiltered] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { loadPosts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(posts.filter(p => p.title.toLowerCase().includes(q)));
  }, [search, posts]);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setFiltered(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/backoffice/blog/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { addToast('Post deleted'); await loadPosts(); }
      else addToast('Failed to delete post', 'error');
    } catch {
      addToast('Error deleting post', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blog</h1>
        <div className="flex gap-2">
          <Link href="/backoffice/blog/categories" className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">
            Categories
          </Link>
          <Link href="/backoffice/blog/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
            New Post
          </Link>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-80 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading posts…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No posts found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const isScheduled = post.status === 'published' && isFuturePublicationDate(post.createdAt);
                const displayStatus = isScheduled ? 'scheduled' : post.status;
                const canPreview = post.status === 'published' && !!post.slug && !isScheduled;
                const previewClassName = canPreview
                  ? 'px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'px-2 py-1 text-xs rounded bg-slate-500 text-slate-200 cursor-not-allowed pointer-events-none';
                const previewTitle = canPreview ? 'Open preview in new tab' : 'Preview available when post is published and not scheduled';
                const statusClassName = displayStatus === 'published'
                  ? 'bg-green-900 text-green-300'
                  : displayStatus === 'scheduled'
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-yellow-900 text-yellow-300';

                return (
                  <tr key={post.id} className="border-t border-slate-600 text-slate-300">
                    <td className="px-4 py-3">{post.title}</td>
                    <td className="px-4 py-3">{post.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusClassName}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={previewClassName}
                        title={previewTitle}
                      >
                        Preview
                      </Link>
                      <Link href={`/backoffice/blog/${post.id}/edit`} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded">Edit</Link>
                      <button onClick={() => setDeleteId(post.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Delete Post</h3>
            <p className="text-slate-400 text-sm mb-4">Are you sure you want to delete this post?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
