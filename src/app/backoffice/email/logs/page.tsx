'use client';

import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
  content?: string;
  error?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmailLog | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/email-logs');
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function resend(id: string) {
    setResending(id);
    try {
      const res = await fetch(`/api/backoffice/email-logs/${id}/resend`, { method: 'POST' });
      if (res.ok) { addToast('Email resent'); await loadLogs(); }
      else addToast('Failed to resend', 'error');
    } catch {
      addToast('Error resending', 'error');
    } finally {
      setResending(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Email Logs</h1>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No email logs found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Recipient</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Sent At</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3">{log.to}</td>
                  <td className="px-4 py-3">{log.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.status === 'sent' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(log.sentAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {log.content && (
                      <button onClick={() => setSelected(log)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded">
                        View
                      </button>
                    )}
                    <button onClick={() => resend(log.id)} disabled={resending === log.id}
                      className="px-2 py-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs rounded">
                      {resending === log.id ? '…' : 'Resend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Body Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold">{selected.subject}</h3>
                <p className="text-slate-400 text-sm">To: {selected.to}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="overflow-auto flex-1 bg-white rounded">
              <iframe
                srcDoc={selected.content}
                className="w-full h-full min-h-[400px] border-0"
                sandbox=""
                title="Email preview"
              />
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
