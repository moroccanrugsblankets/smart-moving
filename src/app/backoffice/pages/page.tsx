'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageItem {
  slug: string;
  title: string;
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/backoffice/pages')
      .then(r => r.json())
      .then((data: PageItem[]) => setPages(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!newSlug.trim() || !newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/backoffice/pages/${newSlug.trim()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        router.push(`/backoffice/pages/${newSlug.trim()}/edit`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Static Pages</h1>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
        >
          + New Page
        </button>
      </div>

      {showNewForm && (
        <div className="bg-slate-700 rounded-lg p-4 space-y-3">
          <h2 className="text-white font-semibold text-sm">Create New Page</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-slate-400 text-xs mb-1">Slug (URL)</label>
              <input
                type="text"
                value={newSlug}
                onChange={e => setNewSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-{2,}/g, '-')
                    .replace(/^-+|-+$/g, '')
                )}
                placeholder="e.g. contact-us"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-slate-400 text-xs mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Contact Us"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newSlug.trim() || !newTitle.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded"
            >
              {creating ? 'Creating…' : 'Create & Edit'}
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewSlug(''); setNewTitle(''); }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Page</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Last Updated</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.slug} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3">{page.title}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">/{page.slug}</td>
                  <td className="px-4 py-3 text-slate-400">{page.updatedAt ? formatDate(page.updatedAt) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/backoffice/pages/${page.slug}/edit`}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                        title="View page"
                      >
                        👁 View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
