'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PageItem {
  slug: string;
  title: string;
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DEFAULT_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'about', title: 'About Us' },
  { slug: 'do-not-sell', title: 'Do Not Sell My Personal Information' },
];

export default function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backoffice/pages')
      .then(r => r.json())
      .then((data: PageItem[]) => {
        const merged = DEFAULT_PAGES.map(dp => {
          const found = data.find(p => p.slug === dp.slug);
          return found ?? { slug: dp.slug, title: dp.title, updatedAt: '' };
        });
        setPages(merged);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Static Pages</h1>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Page</th>
                <th className="text-left px-4 py-3">Last Updated</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.slug} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3">{page.title}</td>
                  <td className="px-4 py-3 text-slate-400">{page.updatedAt ? formatDate(page.updatedAt) : '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/backoffice/pages/${page.slug}/edit`}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded"
                    >
                      Edit
                    </Link>
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
