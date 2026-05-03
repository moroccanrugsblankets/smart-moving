'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toast, useToast } from '@/components/Toast';

interface PageContent {
  slug: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
}

export default function EditPagePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PageContent>({
    slug: '', title: '', content: '', metaTitle: '', metaDesc: '',
    canonical: '', ogTitle: '', ogDesc: '', ogImage: '',
  });

  useEffect(() => {
    fetch(`/api/backoffice/pages/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setForm(data);
        else setForm(f => ({ ...f, slug }));
      });
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/backoffice/pages/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { addToast('Page saved'); }
      else addToast('Failed to save', 'error');
    } catch {
      addToast('Error saving page', 'error');
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof PageContent, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/backoffice/pages')} className="text-slate-400 hover:text-white">←</button>
        <h1 className="text-2xl font-bold text-white">Edit: {form.title || slug}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Content</h2>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Content</label>
            <textarea rows={16} value={form.content} onChange={e => set('content', e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            {saving ? 'Saving…' : 'Save Page'}
          </button>
          <button type="button" onClick={() => router.push('/backoffice/pages')}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded">
            Cancel
          </button>
        </div>
      </form>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
