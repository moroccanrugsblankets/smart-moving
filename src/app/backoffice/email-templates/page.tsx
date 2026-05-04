'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  variables: string[];
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backoffice/email-templates')
      .then(r => r.ok ? r.json() : [])
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Email Templates</h1>

      <div className="bg-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr className="text-slate-400">
                <th className="text-left px-4 py-3">Template</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Variables</th>
                <th className="text-left px-4 py-3">Last Updated</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tpl => (
                <tr key={tpl.id} className="border-t border-slate-600 text-slate-300">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{tpl.name}</div>
                    <div className="text-slate-500 text-xs font-mono">{tpl.key}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{tpl.subject}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tpl.variables.map(v => (
                        <span key={v} className="px-1.5 py-0.5 bg-slate-600 text-slate-300 text-xs rounded font-mono">
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(tpl.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/backoffice/email-templates/${tpl.id}/edit`}
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
