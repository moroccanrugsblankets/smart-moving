'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toast, useToast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  htmlContent: string;
  defaultContent: string;
  variables: string[];
  updatedAt: string;
}

export default function EditEmailTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [tpl, setTpl] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch(`/api/backoffice/email-templates/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setTpl(data);
          setSubject(data.subject);
          setHtmlContent(data.htmlContent);
        }
      });
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/backoffice/email-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlContent }),
      });
      if (res.ok) {
        addToast('Template saved');
        const updated = await res.json();
        setTpl(updated);
      } else {
        addToast('Failed to save template', 'error');
      }
    } catch {
      addToast('Error saving template', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRestoreDefault() {
    setRestoring(true);
    try {
      const res = await fetch(`/api/backoffice/email-templates/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore_default' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTpl(updated);
        setSubject(updated.subject);
        setHtmlContent(updated.htmlContent);
        addToast('Default template restored');
      } else {
        addToast('Failed to restore default', 'error');
      }
    } catch {
      addToast('Error restoring default', 'error');
    } finally {
      setRestoring(false);
      setShowRestoreConfirm(false);
    }
  }

  if (!tpl) {
    return <div className="text-slate-400 p-8">Loading…</div>;
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/backoffice/email-templates')} className="text-slate-400 hover:text-white">←</button>
        <h1 className="text-2xl font-bold text-white">{tpl.name}</h1>
      </div>

      {/* Available variables */}
      <div className="bg-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-sm mb-2 font-medium">Available Variables</p>
        <div className="flex flex-wrap gap-2">
          {tpl.variables.map(v => (
            <span key={v} className="px-2 py-1 bg-slate-600 border border-slate-500 text-slate-200 text-xs rounded font-mono">
              {v}
            </span>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-2">These variables will be replaced with real values when the email is sent.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Template Content</h2>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">HTML Body</label>
            <RichTextEditor value={htmlContent} onChange={setHtmlContent} minHeight={320} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded">
            {saving ? 'Saving…' : 'Save Template'}
          </button>
          <button type="button" onClick={() => setShowRestoreConfirm(true)}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded">
            Restore Default
          </button>
          <button type="button" onClick={() => router.push('/backoffice/email-templates')}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded">
            Cancel
          </button>
        </div>
      </form>

      {/* Restore confirmation modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Restore Default Template</h3>
            <p className="text-slate-400 text-sm mb-4">This will overwrite your custom content with the original default. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">Cancel</button>
              <button onClick={handleRestoreDefault} disabled={restoring}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm rounded">
                {restoring ? 'Restoring…' : 'Restore Default'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
