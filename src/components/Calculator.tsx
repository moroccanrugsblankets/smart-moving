'use client';

import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

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

const STEP_LABELS = [
  'Service & Location',
  'Home Details',
  'Your Estimate',
];

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function pushLeadDataLayer(serviceType: 'moving' | 'cleaning', estimate?: string) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (serviceType === 'moving') {
    window.dataLayer.push({
      event: 'lead_moving',
      serviceType,
      estimate,
    });
  } else if (serviceType === 'cleaning') {
    window.dataLayer.push({
      event: 'lead_cleaning',
      serviceType,
      estimate,
    });
  }

}

const inputClass =
  'w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all';

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<'moving' | 'cleaning'>('moving');
  const [form, setForm] = useState({
    originState: 'TX', destState: 'TX',
    originZip: '', destZip: '',
    homeSize: '2br', squareFeet: '1500', distanceMiles: '50',
    hasStairs: false, hasPacking: false, hasPiano: false, hasLongCarry: false,
  });
  const [distanceReadOnly, setDistanceReadOnly] = useState(true);
  const [distanceLoading, setDistanceLoading]   = useState(false);
  const [distanceError, setDistanceError]       = useState('');
  const distanceAbort = useRef<AbortController | null>(null);

  const [estimate, setEstimate]   = useState<EstimateResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [leadForm, setLeadForm]   = useState({
    firstName: '', lastName: '', email: '', phone: '', serviceDate: '', _honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [affiliatePhone, setAffiliatePhone] = useState('1-844-578-3057');

  useEffect(() => {
    fetch('/api/affiliate')
      .then(r => r.json())
      .then(data => { if (data.affiliatePhone) setAffiliatePhone(data.affiliatePhone); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (serviceType !== 'moving') return;
    const { originZip, destZip } = form;
    if (!/^\d{5}$/.test(originZip) || !/^\d{5}$/.test(destZip)) return;

    // Cancel any previous in-flight request
    distanceAbort.current?.abort();
    const ctrl = new AbortController();
    distanceAbort.current = ctrl;

    setDistanceLoading(true);
    setDistanceError('');

    fetch('/api/zip-distance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originZip, destZip }),
      signal: ctrl.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error('api_error');
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setForm(f => ({ ...f, distanceMiles: String(data.distance) }));
          setDistanceReadOnly(true);
          setDistanceError('');
        } else {
          setDistanceReadOnly(false);
          setDistanceError(
            'Distance could not be calculated automatically, please enter it manually.',
          );
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setDistanceReadOnly(false);
          setDistanceError(
            'Distance could not be calculated automatically, please enter it manually.',
          );
        }
      })
      .finally(() => setDistanceLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.originZip, form.destZip, serviceType]);

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
      if (data.success) {
        pushLeadDataLayer(serviceType, estimate?.formatted);
        setSubmitted(true);
      } else setLeadError(data.error || 'Submission failed. Please try again.');
    } catch {
      setLeadError('Network error. Please try again.');
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      {/* ── Step indicator ── */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const active  = step === s;
            const done    = step > s;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm
                      ${done  ? 'bg-blue-600 text-white'
                      : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-400'}`}
                  >
                    {done ? (
                      <svg className="w-4 h-4" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">What service do you need?</h2>
              <p className="text-sm text-slate-500">Select the type of service and your location.</p>
            </div>

            {/* Segmented control */}
            <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
              {(['moving', 'cleaning'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all
                    ${serviceType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span>{type === 'moving' ? '🚛' : '🧹'}</span>
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Origin State
              </label>
              <select
                value={form.originState}
                onChange={e => setForm(f => ({ ...f, originState: e.target.value }))}
                className={inputClass}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Origin ZIP Code
              </label>
              <input
                type="text" maxLength={5} placeholder="e.g. 10001"
                value={form.originZip}
                onChange={e => setForm(f => ({ ...f, originZip: e.target.value.replace(/\D/g, '') }))}
                className={inputClass}
              />
            </div>

            {serviceType === 'moving' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Destination State
                  </label>
                  <select
                    value={form.destState}
                    onChange={e => setForm(f => ({ ...f, destState: e.target.value }))}
                    className={inputClass}
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Destination ZIP Code
                  </label>
                  <input
                    type="text" maxLength={5} placeholder="e.g. 90210"
                    value={form.destZip}
                    onChange={e => setForm(f => ({ ...f, destZip: e.target.value.replace(/\D/g, '') }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Estimated Distance (miles)
                  </label>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number" min={1} value={form.distanceMiles}
                        readOnly={distanceReadOnly}
                        onChange={e => setForm(f => ({ ...f, distanceMiles: e.target.value }))}
                        className={`${inputClass} pr-10 ${
                          distanceLoading
                            ? 'bg-blue-50 border-blue-300 text-blue-400'
                            : distanceReadOnly
                              ? 'bg-slate-100 text-slate-600 cursor-default'
                              : ''
                        }`}
                      />
                      {distanceLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="animate-spin w-4 h-4 text-blue-500" width={16} height={16} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {distanceReadOnly && !distanceLoading && (
                      <button
                        type="button"
                        onClick={() => setDistanceReadOnly(false)}
                        className="flex-shrink-0 text-xs font-semibold text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 px-3 h-12 rounded-xl transition-all"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {distanceError && (
                    <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {distanceError}
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Next Step →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Tell us about your home</h2>
              <p className="text-sm text-slate-500">We use this to compute an accurate estimate.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Home Size</label>
              <div className="grid grid-cols-2 gap-2">
                {HOME_SIZES.map(hs => (
                  <button
                    key={hs.value}
                    onClick={() => setForm(f => ({ ...f, homeSize: hs.value }))}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.homeSize === hs.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    {hs.label}
                  </button>
                ))}
              </div>
            </div>

            {serviceType === 'cleaning' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Square Footage (sq ft)
                </label>
                <input
                  type="number" min={100} value={form.squareFeet}
                  onChange={e => setForm(f => ({ ...f, squareFeet: e.target.value }))}
                  className={inputClass}
                />
              </div>
            )}

            {serviceType === 'moving' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Complexity Options
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'hasStairs',    label: 'Stairs', detail: '+10%' },
                    { key: 'hasPacking',   label: 'Full Packing Service', detail: '+20%' },
                    { key: 'hasPiano',     label: 'Piano or Heavy Item', detail: '+15%' },
                    { key: 'hasLongCarry', label: 'Long Carry / Elevator', detail: '+8%' },
                  ].map(opt => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${form[opt.key as keyof typeof form]
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={form[opt.key as keyof typeof form] as boolean}
                        onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="flex-1 text-sm font-medium text-slate-700">{opt.label}</span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{opt.detail}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-slate-200 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleCalculate} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" width={16} height={16} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Calculating…
                  </span>
                ) : 'Get My Estimate →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && estimate && (
          <div className="space-y-6">
            {/* Hero estimate result */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Estimated {serviceType === 'moving' ? 'Moving' : 'Cleaning'} Cost
              </p>
              <p className="text-5xl font-black text-green-600 leading-tight">{estimate.formatted}</p>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <svg className="w-4 h-4 text-green-500" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-semibold text-green-700">Verified 2026 Market Data</span>
              </div>
            </div>

            {!submitted ? (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-800">Get Guaranteed Quotes</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Top-rated movers compete for your job — 100% free.</p>
                </div>

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
                    className={inputClass}
                  />
                  <input
                    required placeholder="Last Name" value={leadForm.lastName}
                    onChange={e => setLeadForm(f => ({ ...f, lastName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <input
                  required type="email" placeholder="Email Address" value={leadForm.email}
                  onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
                <input
                  required type="tel" placeholder="(555) 555-5555" value={leadForm.phone}
                  onChange={e => setLeadForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                  className={inputClass}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Preferred Service Date
                  </label>
                  <input
                    required type="date" value={leadForm.serviceDate}
                    onChange={e => setLeadForm(f => ({ ...f, serviceDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {leadError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{leadError}</p>}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  🎯 Get Guaranteed Quotes — Free
                </button>
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  By clicking, I consent to receive calls and/or SMS from GetMoveCost.com and its
                  affiliated partners regarding moving services, even if my number is on a
                  Do-Not-Call registry (TCPA). Consent is not a condition of purchase. Msg &amp;
                  data rates may apply.
                </p>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">You&apos;re All Set!</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto">
                  Top-rated movers will contact you within 2 hours with guaranteed quotes.
                </p>
                <button
                  onClick={() => { setStep(1); setEstimate(null); setSubmitted(false); }}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline"
                >
                  Start a new estimate
                </button>
              </div>
            )}

            {/* Locksmith / home-security CTA */}
            <div className="border-2 border-dashed border-blue-400 rounded-2xl p-6 text-center space-y-4 bg-white">
              <h3 className="text-xl font-bold text-slate-800">Moving Into a New House?</h3>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Don&apos;t let unexpected repairs or lock issues ruin your moving day. Get a certified
                local technician to secure your{' '}
                <span className="text-blue-600 font-medium">new home</span> immediately.
              </p>
              <a
                href={`tel:${affiliatePhone.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-all"
              >
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.26.2 2.47.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                </svg>
                Call Our 24/7 Hotline:&nbsp;{affiliatePhone}
              </a>
              <p className="text-xs text-slate-400">Free Quotes &amp; Immediate Availability Verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
