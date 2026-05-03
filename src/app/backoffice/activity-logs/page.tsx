'use client';

import { useState, useEffect } from 'react';

interface ActivityLog {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/backoffice/activity-logs')
      .then(r => r.ok ? r.json() : [])
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search || [l.action, l.userEmail, l.details, l.resource].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Activity Logs</h1>

      <div>
        <input
          type="text"
          placeholder="Search logs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-slate-700 rounded-lg overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No activity logs found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3 whitespace-nowrap">Timestamp</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Resource</th>
                <th className="text-left px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-xs">{log.userEmail ?? log.userId ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-600 text-slate-200">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{log.resource ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{log.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
