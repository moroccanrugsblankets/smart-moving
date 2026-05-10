'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface PageItem {
  slug: string;
  title: string;
  showInFooter: boolean;
  footerOrder: number;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterSettingsData {
  description: string;
  quickLinks: FooterLink[];
  customLinks: FooterLink[];
}

export default function FooterSettingsPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [settings, setSettings] = useState<FooterSettingsData>({ description: '', quickLinks: [], customLinks: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch('/api/backoffice/pages').then(r => r.json()),
      fetch('/api/backoffice/footer-settings').then(r => r.json()),
    ])
      .then(([pagesData, settingsData]: [PageItem[], FooterSettingsData]) => {
        setPages(pagesData.slice().sort((a, b) => a.footerOrder - b.footerOrder));
        setSettings(settingsData);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Save footer settings (description + custom links)
      const settingsRes = await fetch('/api/backoffice/footer-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      // Save each page's showInFooter and footerOrder
      const pageRes = await Promise.all(
        pages.map((p, i) =>
          fetch(`/api/backoffice/pages/${p.slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showInFooter: p.showInFooter, footerOrder: i }),
          })
        )
      );

      if (settingsRes.ok && pageRes.every(r => r.ok)) {
        addToast('Footer settings saved');
      } else {
        addToast('Failed to save some settings', 'error');
      }
    } catch {
      addToast('Error saving footer settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  function togglePage(slug: string) {
    setPages(prev => prev.map(p => p.slug === slug ? { ...p, showInFooter: !p.showInFooter } : p));
  }

  function movePage(index: number, direction: 'up' | 'down') {
    const newPages = [...pages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPages.length) return;
    [newPages[index], newPages[swapIndex]] = [newPages[swapIndex], newPages[index]];
    setPages(newPages);
  }

  function addCustomLink() {
    setSettings(prev => ({
      ...prev,
      customLinks: [...prev.customLinks, { id: crypto.randomUUID(), label: '', url: '' }],
    }));
  }

  function updateCustomLink(id: string, key: keyof FooterLink, value: string) {
    setSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.map(l => l.id === id ? { ...l, [key]: value } : l),
    }));
  }

  function removeCustomLink(id: string) {
    setSettings(prev => ({ ...prev, customLinks: prev.customLinks.filter(l => l.id !== id) }));
  }

  function addQuickLink() {
    setSettings(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { id: crypto.randomUUID(), label: '', url: '' }],
    }));
  }

  function updateQuickLink(id: string, key: keyof FooterLink, value: string) {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.map(l => l.id === id ? { ...l, [key]: value } : l),
    }));
  }

  function removeQuickLink(id: string) {
    setSettings(prev => ({ ...prev, quickLinks: prev.quickLinks.filter(l => l.id !== id) }));
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Footer Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Footer Description</h2>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Description text</label>
            <textarea
              value={settings.description}
              onChange={e => setSettings(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
          </div>
        </div>

        {/* Legal pages visibility & order */}
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Legal Pages — Visibility &amp; Order</h2>
          <p className="text-slate-400 text-xs">Toggle which pages appear in the footer legal menu and drag-sort their order.</p>
          <div className="space-y-2">
            {pages.map((page, i) => (
              <div key={page.slug} className="flex items-center gap-3 bg-slate-600 rounded px-3 py-2">
                <input
                  type="checkbox"
                  id={`show-${page.slug}`}
                  checked={page.showInFooter}
                  onChange={() => togglePage(page.slug)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <label htmlFor={`show-${page.slug}`} className="flex-1 text-sm text-white cursor-pointer">
                  {page.title}
                  <span className="text-slate-400 text-xs ml-2">/{page.slug}</span>
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => movePage(i, 'up')}
                    disabled={i === 0}
                    className="px-2 py-0.5 text-xs bg-slate-500 hover:bg-slate-400 disabled:opacity-30 text-white rounded"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(i, 'down')}
                    disabled={i === pages.length - 1}
                    className="px-2 py-0.5 text-xs bg-slate-500 hover:bg-slate-400 disabled:opacity-30 text-white rounded"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Quick Links</h2>
            <button
              type="button"
              onClick={addQuickLink}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              + Add Link
            </button>
          </div>
          {settings.quickLinks.length === 0 && (
            <p className="text-slate-400 text-xs">No quick links yet.</p>
          )}
          {settings.quickLinks.map(link => (
            <div key={link.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={e => updateQuickLink(link.id, 'label', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /about or https://…)"
                  value={link.url}
                  onChange={e => updateQuickLink(link.id, 'url', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeQuickLink(link.id)}
                className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded mt-1"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Custom links */}
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Custom Links</h2>
            <button
              type="button"
              onClick={addCustomLink}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              + Add Link
            </button>
          </div>
          {settings.customLinks.length === 0 && (
            <p className="text-slate-400 text-xs">No custom links yet.</p>
          )}
          {settings.customLinks.map(link => (
            <div key={link.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={e => updateCustomLink(link.id, 'label', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /about or https://…)"
                  value={link.url}
                  onChange={e => updateCustomLink(link.id, 'url', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCustomLink(link.id)}
                className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded mt-1"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded"
          >
            {saving ? 'Saving…' : 'Save Footer Settings'}
          </button>
        </div>
      </form>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
