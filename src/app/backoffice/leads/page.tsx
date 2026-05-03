'use client';

import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  estimate?: string;
  serviceDate: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      leads.filter(
        l =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.serviceType.toLowerCase().includes(q)
      )
    );
  }, [search, leads]);

  async function loadLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setLeads(arr);
      setFiltered(arr);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== deleteId));
        addToast('Lead deleted successfully');
      } else {
        addToast('Failed to delete lead', 'error');
      }
    } catch {
      addToast('Error deleting lead', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Service Type', 'Estimate', 'Service Date', 'Submitted'];
    const rows = filtered.map(l => [
      `${l.firstName} ${l.lastName}`,
      l.email,
      l.phone,
      l.serviceType,
      l.estimate ?? '',
      l.serviceDate,
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search by name, email, or service type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-80 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr className="text-slate-400">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Service</th>
                  <th className="text-left px-4 py-3">Estimate</th>
                  <th className="text-left px-4 py-3">Service Date</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={`border-t border-slate-600 text-slate-300 ${i % 2 === 0 ? '' : 'bg-slate-800/30'}`}
                  >
                    <td className="px-4 py-3">{lead.firstName} {lead.lastName}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3">{lead.phone}</td>
                    <td className="px-4 py-3 capitalize">{lead.serviceType}</td>
                    <td className="px-4 py-3">{lead.estimate ?? '—'}</td>
                    <td className="px-4 py-3">{lead.serviceDate}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(lead.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Delete Lead</h3>
            <p className="text-slate-400 text-sm mb-4">Are you sure you want to delete this lead? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
