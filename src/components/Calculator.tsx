'use client';

import { useState } from 'react';

interface EstimateResult {
  low: number;
  high: number;
  formatted: string;
}

const HOME_SIZES = [
  { value: 'studio', label: 'Studio / Efficiency' },
  { value: '1br',    label: '1 Bedroom' },
  { value: '2br',    label: '2 Bedrooms' },
  { value: '3br',    label: '3 Bedrooms' },
  { value: '4br',    label: '4+ Bedrooms' },
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<'moving' | 'cleaning'>('moving');
  const [form, setForm] = useState({
    originState: 'TX', destState: 'TX',
    originZip: '', destZip: '',
    homeSize: '2br', squareFeet: '1500', distanceMiles: '50',
    hasStairs: false, hasPacking: false, hasPiano: false, hasLongCarry: false,
  });
  const [estimate, setEstimate]   = useState<EstimateResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [leadForm, setLeadForm]   = useState({
    firstName: '', lastName: '', email: '', phone: '', serviceDate: '', _honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [leadError, setLeadError] = useState('');

  async function handleCalculate() {
    setLoading(true);
    try {
      const payload =
        serviceType === 'moving'
          ? {
              serviceType: 'moving',
              homeSize: form.homeSize,
              originState: form.originState,
              destState: form.destState,
              distanceMiles: Number(form.distanceMiles),
              hasStairs: form.hasStairs,
              hasPacking: form.hasPacking,
              hasPiano: form.hasPiano,
              hasLongCarry: form.hasLongCarry,
            }
          : {
              serviceType: 'cleaning',
              squareFeet: Number(form.squareFeet),
              state: form.originState,
            };

      const res  = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { setEstimate(data.estimate); setStep(3); }
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLeadError('');
    try {
      const res  = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm, serviceType,
          originZip: form.originZip, destZip: form.destZip,
          homeSize: form.homeSize, estimate: estimate?.formatted,
        }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setLeadError(data.error || 'Submission failed. Please try again.');
    } catch {
      setLeadError('Network error. Please try again.');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Progress bar */}
      <div className="bg-slate-100 px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${step >= s ? 'bg-[#1E40AF] text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-12 rounded ${step > s ? 'bg-[#1E40AF]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {step === 1 && 'Step 1 of 3 — Select Service & Location'}
          {step === 2 && 'Step 2 of 3 — Home Details & Options'}
          {step === 3 && 'Step 3 of 3 — Your Estimate & Get Quotes'}
        </p>
      </div>

      <div className="p-6">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800">What service do you need?</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['moving', 'cleaning'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className={`p-4 rounded-xl border-2 font-semibold capitalize transition-all
                    ${serviceType === type
                      ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {type === 'moving' ? '🚛 Moving' : '🧹 Cleaning'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Origin State
              </label>
              <select
                value={form.originState}
                onChange={e => setForm(f => ({ ...f, originState: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Origin ZIP Code
              </label>
              <input
                type="text" maxLength={5} placeholder="e.g. 10001"
                value={form.originZip}
                onChange={e => setForm(f => ({ ...f, originZip: e.target.value.replace(/\D/g, '') }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {serviceType === 'moving' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Destination State
                  </label>
                  <select
                    value={form.destState}
                    onChange={e => setForm(f => ({ ...f, destState: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Destination ZIP Code
                  </label>
                  <input
                    type="text" maxLength={5} placeholder="e.g. 90210"
                    value={form.destZip}
                    onChange={e => setForm(f => ({ ...f, destZip: e.target.value.replace(/\D/g, '') }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated Distance (miles)
                  </label>
                  <input
                    type="number" min={1} value={form.distanceMiles}
                    onChange={e => setForm(f => ({ ...f, distanceMiles: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800">Tell us about your home</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Home Size</label>
              <div className="grid grid-cols-2 gap-2">
                {HOME_SIZES.map(hs => (
                  <button
                    key={hs.value}
                    onClick={() => setForm(f => ({ ...f, homeSize: hs.value }))}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${form.homeSize === hs.value
                        ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {hs.label}
                  </button>
                ))}
              </div>
            </div>

            {serviceType === 'cleaning' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Square Footage (sq ft)
                </label>
                <input
                  type="number" min={100} value={form.squareFeet}
                  onChange={e => setForm(f => ({ ...f, squareFeet: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {serviceType === 'moving' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Complexity Options
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'hasStairs',    label: '🏗️ Stairs (+10%)' },
                    { key: 'hasPacking',   label: '📦 Full Packing Service (+20%)' },
                    { key: 'hasPiano',     label: '🎹 Piano or Heavy Item (+15%)' },
                    { key: 'hasLongCarry', label: '🚶 Long Carry / Elevator (+8%)' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[opt.key as keyof typeof form] as boolean}
                        onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#1E40AF]"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleCalculate} disabled={loading}
                className="flex-1 bg-[#1E40AF] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? 'Calculating…' : 'Get My Estimate →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && estimate && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-500 mb-1">
                Estimated {serviceType === 'moving' ? 'Moving' : 'Cleaning'} Cost
              </p>
              <p className="text-4xl font-extrabold text-[#1E40AF]">{estimate.formatted}</p>
              <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                ✅ Verified for May 2026
              </span>
            </div>

            {!submitted ? (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <h3 className="font-bold text-slate-800">Get Guaranteed Quotes from Top Movers</h3>

                {/* Honeypot */}
                <input
                  type="text" name="_honeypot" value={leadForm._honeypot}
                  onChange={e => setLeadForm(f => ({ ...f, _honeypot: e.target.value }))}
                  tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    required placeholder="First Name" value={leadForm.firstName}
                    onChange={e => setLeadForm(f => ({ ...f, firstName: e.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    required placeholder="Last Name" value={leadForm.lastName}
                    onChange={e => setLeadForm(f => ({ ...f, lastName: e.target.value }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <input
                  required type="email" placeholder="Email Address" value={leadForm.email}
                  onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  required type="tel" placeholder="(555) 555-5555" value={leadForm.phone}
                  onChange={e => setLeadForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Preferred Service Date</label>
                  <input
                    required type="date" value={leadForm.serviceDate}
                    onChange={e => setLeadForm(f => ({ ...f, serviceDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {leadError && <p className="text-red-600 text-sm">{leadError}</p>}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  🎯 Get Guaranteed Quotes — Free
                </button>
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  By clicking, I consent to receive calls and/or SMS from SmartMoving.com and its
                  affiliated partners regarding moving services, even if my number is on a
                  Do-Not-Call registry (TCPA). Consent is not a condition of purchase. Msg &amp;
                  data rates may apply.
                </p>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-4xl">🎉</p>
                <h3 className="text-xl font-bold text-slate-800">You&apos;re All Set!</h3>
                <p className="text-slate-600 text-sm">
                  Top-rated movers will contact you within 2 hours with guaranteed quotes.
                </p>
                <button
                  onClick={() => { setStep(1); setEstimate(null); setSubmitted(false); }}
                  className="text-[#1E40AF] underline text-sm"
                >
                  Start a new estimate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
