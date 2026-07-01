'use client';

import Link from 'next/link';

export default function MovingChecklist() {
  return (
    <div className="mt-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800">✅ Your Moving Checklist</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Don&apos;t forget these critical pre-move-in services.
        </p>
      </div>

      {/* Card 1 — Pest Control */}
      <Link
        href="/moving-pest-control"
        className="flex items-start gap-4 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-5 transition-all group"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
          🐛
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">
            Pre-Move-In Inspection
          </p>
          <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-amber-700 transition-colors">
            Pest Inspection &amp; Prevention
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Don&apos;t bring pests to your new home — inspect before you unpack.
          </p>
        </div>
        <svg
          className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Card 2 — Plumbing */}
      <Link
        href="/moving-plumbing"
        className="flex items-start gap-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 transition-all group"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
          🔧
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-0.5">
            Pre-Move-In Inspection
          </p>
          <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">
            Plumbing Inspection &amp; Appliance Hookup
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Check your pipes before unpacking — find leaks &amp; get appliances connected.
          </p>
        </div>
        <svg
          className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
