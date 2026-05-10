'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUploadField from '@/components/ImageUploadField';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  categoryIds: string[];
  featuredImage: string;
  tags: string[];
  status: 'draft' | 'published';
  metaTitle: string;
  metaDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  createdAt: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogFormProps {
  initialData?: Partial<BlogPost>;
  postId?: string;
}

function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isFuturePublicationDate(iso?: string) {
  if (!iso) return false;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

function toDateTimeLocalInputValue(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function BlogForm({ initialData, postId }: BlogFormProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [slugLocked, setSlugLocked] = useState(!!postId);
  const [form, setForm] = useState<BlogPost>({
    title: '', slug: '', content: '', excerpt: '', category: '',
    categoryIds: [], featuredImage: '',
    tags: [], status: 'draft',
    metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '',
    createdAt: new Date().toISOString(),
    ...initialData,
  });
  const [tagsStr, setTagsStr] = useState(initialData?.tags?.join(', ') ?? '');
  const isScheduled = form.status === 'published' && isFuturePublicationDate(form.createdAt);

  useEffect(() => {
    fetch('/api/backoffice/blog/categories')
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  function set<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugLocked) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  function handleSlugChange(value: string) {
    setSlugLocked(true);
    setForm(prev => ({ ...prev, slug: value }));
  }

  function regenerateSlug() {
    setSlugLocked(false);
    setForm(prev => ({ ...prev, slug: slugify(prev.title) }));
  }

  function toggleCategory(id: string) {
    setForm(prev => {
      const ids = prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(c => c !== id)
        : [...prev.categoryIds, id];
      return { ...prev, categoryIds: ids };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const parsedPublicationDate = new Date(form.createdAt);
    const payload = {
      ...form,
      tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: isNaN(parsedPublicationDate.getTime()) ? undefined : parsedPublicationDate.toISOString(),
    };
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 text-sm">Slug</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={regenerateSlug}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                title="Regenerate slug from title"
              >
                ↺ Regenerate from title
              </button>
              {form.slug && form.status === 'published' && !isScheduled ? (
                <Link
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                  title="Open preview in new tab"
                >
                  Preview
                </Link>
              ) : (
                <span
                  className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300 cursor-not-allowed"
                    title="Preview available when post is published, not scheduled, and has a slug"
                >
                  Preview
                </span>
              )}
            </div>
          </div>
          <input
            type="text"
            value={form.slug}
            onChange={e => handleSlugChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.slug && (
            <p className="mt-1 text-xs text-slate-500 font-mono truncate">
              /blog/<span className="text-slate-400">{form.slug}</span>
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Content *</label>
          <RichTextEditor value={form.content} onChange={v => set('content', v)} minHeight={320} />
        </div>

        <ImageUploadField
          label="Featured Image"
          value={form.featuredImage}
          onChange={url => set('featuredImage', url)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Tags (comma-separated)</label>
            <input type="text" value={tagsStr} onChange={e => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Publication Date</label>
            <input
              type="datetime-local"
              value={toDateTimeLocalInputValue(form.createdAt)}
              onChange={e => {
                const value = e.target.value;
                if (!value) {
                  set('createdAt', '');
                  return;
                }
                const nextDate = new Date(value);
                if (!isNaN(nextDate.getTime())) set('createdAt', nextDate.toISOString());
              }}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {isScheduled && (
              <p className="mt-1 text-xs text-blue-300">This post is scheduled (future publication date).</p>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-slate-400 text-sm mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const selected = form.categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1 rounded text-xs border transition-colors ${
                      selected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-600 border-slate-500 text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
