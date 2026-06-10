'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Toast, useToast } from '@/components/Toast';

export default function AffiliatePage() {
  const [affiliatePhone, setAffiliatePhone] = useState('');
  const [affiliateTitle, setAffiliateTitle] = useState('');
  const [affiliateDescription, setAffiliateDescription] = useState('');
  const [affiliateButtonText, setAffiliateButtonText] = useState('');
  const [affiliateFooterText, setAffiliateFooterText] = useState('');
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch('/api/backoffice/affiliate')
      .then(r => r.json())
      .then(data => {
        setAffiliatePhone(data.affiliatePhone ?? '');
        setAffiliateTitle(data.affiliateTitle ?? '');
        setAffiliateDescription(data.affiliateDescription ?? '');
        setAffiliateButtonText(data.affiliateButtonText ?? '');
        setAffiliateFooterText(data.affiliateFooterText ?? '');
      })
      .catch(() => addToast('Failed to load affiliate settings', 'error'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/backoffice/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliatePhone,
          affiliateTitle,
          affiliateDescription,
          affiliateButtonText,
          affiliateFooterText,
        }),
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
          <h2 className="text-white font-semibold">CTA Block</h2>
          <p className="text-slate-400 text-sm">
            Customize the call-to-action block displayed in Step 3 of the calculator.
          </p>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Title</label>
            <input
              type="text"
              value={affiliateTitle}
              onChange={e => setAffiliateTitle(e.target.value)}
              placeholder="Moving Into a New House?"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Description</label>
            <textarea
              value={affiliateDescription}
              onChange={e => setAffiliateDescription(e.target.value)}
              placeholder="Don't let unexpected repairs or lock issues ruin your moving day…"
              rows={3}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Button Text Prefix</label>
            <input
              type="text"
              value={affiliateButtonText}
              onChange={e => setAffiliateButtonText(e.target.value)}
              placeholder="Call Our 24/7 Hotline:"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-slate-500 text-xs mt-1">The phone number is appended automatically after this text.</p>
          </div>

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

          <div>
            <label className="block text-slate-400 text-sm mb-1">Footer Note</label>
            <input
              type="text"
              value={affiliateFooterText}
              onChange={e => setAffiliateFooterText(e.target.value)}
              placeholder="Free Quotes & Immediate Availability Verification"
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
