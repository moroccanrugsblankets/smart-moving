'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  encryption: 'SSL' | 'TLS' | 'none';
}

export default function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig>({ host: '', port: 587, username: '', password: '', fromEmail: '', encryption: 'TLS' });
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch('/api/backoffice/email-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setConfig(data); });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/backoffice/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) addToast('Email config saved');
      else addToast('Failed to save', 'error');
    } catch {
      addToast('Error saving config', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function sendTestEmail() {
    if (!testEmail) return;
    setTestLoading(true);
    try {
      const res = await fetch('/api/backoffice/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      if (res.ok) { addToast('Test email sent successfully'); setShowTestModal(false); }
      else { const e = await res.json(); addToast(e.error ?? 'Failed to send test email', 'error'); }
    } catch {
      addToast('Error sending test email', 'error');
    } finally {
      setTestLoading(false);
    }
  }

  function set(key: keyof EmailConfig, value: string | number) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Email Configuration</h1>
        <button
          onClick={() => setShowTestModal(true)}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
        >
          Send Test Email
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">SMTP Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">SMTP Host</label>
              <input type="text" value={config.host} onChange={e => set('host', e.target.value)}
                placeholder="smtp.example.com"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Port</label>
              <input type="number" value={config.port} onChange={e => set('port', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Username</label>
            <input type="text" value={config.username} onChange={e => set('username', e.target.value)}
              autoComplete="off"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Password</label>
            <input type="password" value={config.password} onChange={e => set('password', e.target.value)}
              autoComplete="new-password"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">From Email</label>
            <input type="email" value={config.fromEmail} onChange={e => set('fromEmail', e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Encryption</label>
            <select value={config.encryption} onChange={e => set('encryption', e.target.value as 'SSL' | 'TLS' | 'none')}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded">
          {saving ? 'Saving…' : 'Save Configuration'}
        </button>
      </form>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-3">Send Test Email</h3>
            <label className="block text-slate-400 text-sm mb-1">Recipient Email</label>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 mb-4 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowTestModal(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded">Cancel</button>
              <button onClick={sendTestEmail} disabled={testLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded">
                {testLoading ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
