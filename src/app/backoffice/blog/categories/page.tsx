'use client';

import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { loadCats(); }, []);

  async function loadCats() {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/blog/categories');
      if (res.ok) setCats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function addCat() {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/backoffice/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) { addToast('Category added'); setNewName(''); await loadCats(); }
      else addToast('Failed to add category', 'error');
    } catch {
      addToast('Error adding category', 'error');
    }
  }

  async function deleteCat(id: string) {
    try {
      const res = await fetch('/api/backoffice/blog/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { addToast('Category deleted'); await loadCats(); }
      else addToast('Failed to delete', 'error');
    } catch {
      addToast('Error deleting category', 'error');
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold text-white">Blog Categories</h1>

      <div className="bg-slate-700 rounded-lg p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Category name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCat()}
            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addCat} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : cats.length === 0 ? (
          <p className="text-slate-400 text-sm">No categories yet.</p>
        ) : (
          <ul className="space-y-2">
            {cats.map(cat => (
              <li key={cat.id} className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                <div>
                  <span className="text-white text-sm">{cat.name}</span>
                  <span className="text-slate-400 text-xs ml-2 font-mono">/{cat.slug}</span>
                </div>
                <button onClick={() => deleteCat(cat.id)} className="text-red-400 hover:text-red-300 text-xs">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
