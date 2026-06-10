'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Toast, useToast } from '@/components/Toast';

export default function AffiliatePage() {
  const [affiliatePhone, setAffiliatePhone] = useState('');
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch('/api/backoffice/affiliate')
      .then(r => r.json())
      .then(data => setAffiliatePhone(data.affiliatePhone ?? ''))
      .catch(() => addToast('Failed to load affiliate settings', 'error'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/backoffice/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliatePhone }),
      });
      if (res.ok) addToast('Affiliate settings saved successfully');
      else addToast('Failed to save affiliate settings', 'error');
    } catch {
      addToast('Error saving affiliate settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Affiliate Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-700 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Affiliate Phone Number</h2>
          <p className="text-slate-400 text-sm">
            This phone number is displayed in the estimate result (Step 3) of the calculator,
            in the call-to-action block. Update it here whenever you change your affiliate partner.
          </p>
          <div>
            <label className="block text-slate-400 text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              value={affiliatePhone}
              onChange={e => setAffiliatePhone(e.target.value)}
              placeholder="1-844-578-3057"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded transition-colors"
        >
          {saving ? 'Saving…' : 'Save Affiliate Settings'}
        </button>
      </form>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
