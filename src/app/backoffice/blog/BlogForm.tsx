'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Toast, useToast } from '@/components/Toast';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  metaTitle: string;
  metaDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
}

interface BlogFormProps {
  initialData?: Partial<BlogPost>;
  postId?: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogForm({ initialData, postId }: BlogFormProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BlogPost>({
    title: '', slug: '', content: '', excerpt: '', category: '',
    tags: [], status: 'draft',
    metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '',
    ...initialData,
  });
  const [tagsStr, setTagsStr] = useState(initialData?.tags?.join(', ') ?? '');

  function set<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !postId) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const res = postId
        ? await fetch(`/api/backoffice/blog/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/backoffice/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        addToast(postId ? 'Post updated' : 'Post created');
        setTimeout(() => router.push('/backoffice/blog'), 1000);
      } else {
        addToast('Failed to save post', 'error');
      }
    } catch {
      addToast('Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-white font-semibold">Content</h2>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Title *</label>
          <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Content *</label>
          <textarea rows={12} required value={form.content} onChange={e => set('content', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Tags (comma-separated)</label>
            <input type="text" value={tagsStr} onChange={e => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as 'draft' | 'published')}
            className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-6 space-y-4">
        <h2 className="text-white font-semibold">SEO</h2>
        {[
          { label: 'Meta Title', key: 'metaTitle' as const },
          { label: 'Meta Description', key: 'metaDesc' as const },
          { label: 'Canonical URL', key: 'canonical' as const },
          { label: 'OG Title', key: 'ogTitle' as const },
          { label: 'OG Description', key: 'ogDesc' as const },
          { label: 'OG Image URL', key: 'ogImage' as const },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-slate-400 text-sm mb-1">{f.label}</label>
            <input type="text" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded">
          {saving ? 'Saving…' : postId ? 'Update Post' : 'Create Post'}
        </button>
        <button type="button" onClick={() => router.push('/backoffice/blog')}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded">
          Cancel
        </button>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </form>
  );
}
