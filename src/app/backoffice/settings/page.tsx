'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface Settings {
  companyName: string;
  tagline: string;
  logoUrlHeader: string;
  logoUrlFooter: string;
  faviconUrl: string;
  adminEmail: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    companyName: '', tagline: '', logoUrlHeader: '', logoUrlFooter: '',
    faviconUrl: '', adminEmail: '', socialLinks: {},
  });
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch('/api/backoffice/settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => addToast('Failed to load settings', 'error'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/backoffice/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) addToast('Settings saved successfully');
      else addToast('Failed to save settings', 'error');
    } catch {
      addToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof Settings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function setSocial(key: keyof Settings['socialLinks'], value: string) {
    setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">General Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Company</h2>
          {[
            { label: 'Company Name', key: 'companyName' as const },
            { label: 'Tagline', key: 'tagline' as const },
            { label: 'Admin Notification Email', key: 'adminEmail' as const, type: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-slate-400 text-sm mb-1">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={settings[f.key] as string}
                onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Branding</h2>
          {[
            { label: 'Logo URL (Header)', key: 'logoUrlHeader' as const },
            { label: 'Logo URL (Footer)', key: 'logoUrlFooter' as const },
            { label: 'Favicon URL', key: 'faviconUrl' as const },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-slate-400 text-sm mb-1">{f.label}</label>
              <input
                type="url"
                value={settings[f.key] as string}
                onChange={e => set(f.key, e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Social Media</h2>
          {(['twitter', 'facebook', 'linkedin', 'instagram'] as const).map(key => (
            <div key={key}>
              <label className="block text-slate-400 text-sm mb-1 capitalize">{key}</label>
              <input
                type="url"
                value={settings.socialLinks[key] ?? ''}
                onChange={e => setSocial(key, e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded transition-colors"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
