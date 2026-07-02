import type { Metadata } from 'next';
import Link from 'next/link';

// ── Update this number to change the tracking phone across the whole page ──
const PEST_PHONE_DISPLAY = '1-855-730-1574';
const PEST_PHONE_TEL = '18557301574';

export const metadata: Metadata = {
  title: 'Pest Control for Movers — Pre-Move-In Inspection | GetMoveCost.com',
  description:
    'Moving to a new home? Book a professional pest inspection and preventative treatment before you unpack. Get a free quote from 24/7 local pros — safe for families and pets.',
  keywords:
    'pest control for movers, pre move in pest inspection, bed bugs new home, pest treatment before moving in',
};

const TRUST_BADGES = [
  { icon: '🕐', label: '24/7 Local Pros' },
  { icon: '💬', label: 'Free Quote' },
  { icon: '✅', label: '100% Safe for Families' },
];

const PEST_TYPES = [
  { icon: '🐜', name: 'Ants & Roaches', desc: 'Full perimeter and interior treatment' },
  { icon: '🐭', name: 'Rodents', desc: 'Exclusion, trapping & preventative barriers' },
  { icon: '🛏️', name: 'Bed Bugs', desc: 'Heat or chemical treatment before furniture arrives' },
  { icon: '🕷️', name: 'Spiders & Wasps', desc: 'Web removal and nest elimination' },
  { icon: '🐜', name: 'Termites', desc: 'Structural inspection and wood protection' },
  { icon: '🦟', name: 'Mosquitoes', desc: 'Yard treatment for outdoor living areas' },
];

function CallButton() {
  return (
    <a
      href={`tel:${PEST_PHONE_TEL}`}
      className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 px-6 rounded-full shadow-xl text-lg transition-all active:scale-95"
    >
      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.26.2 2.47.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
      </svg>
      Call Now — {PEST_PHONE_DISPLAY}
    </a>
  );
}

export default function MovingPestControlPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-white/25">
            🏠 Moving Checklist — Step 1
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Moving to a New Home? Ensure It&apos;s Pest-Free Before You Unpack!
          </h1>
          <p className="text-base text-orange-100 leading-relaxed max-w-xl mx-auto">
            An empty home is the <strong className="text-white">best window</strong> for a
            structural pest inspection. Treat bed bugs, roaches, and rodents{' '}
            <em>before your furniture blocks access</em> — not after.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {TRUST_BADGES.map(b => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20"
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-sm mx-auto pt-2">
            <CallButton />
            <p className="text-xs text-orange-200 mt-2">
              Free quotes — no obligation. Immediate availability verification.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why now ── */}
      <section className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-5">
          <p className="font-bold text-slate-800 mb-1">⚠️ Why treat before you move in?</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Once your furniture, boxes, and belongings fill every corner, pest technicians lose
            access to walls, baseboards, and crawl spaces. Treating an empty home means{' '}
            <strong>faster, more thorough coverage</strong> — and no need to move anything out
            later.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-5">
            Common Pests Found in &quot;Move-In Ready&quot; Homes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PEST_TYPES.map(p => (
              <div
                key={p.name}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-2xl mb-1">{p.icon}</p>
                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-4">How It Works</h2>
          <ol className="space-y-3">
            {[
              { n: '1', t: 'Call Our 24/7 Hotline', d: 'Speak to a local specialist in minutes — free quote, no obligation.' },
              { n: '2', t: 'Schedule Your Inspection', d: 'We work around your moving timeline, including same-day slots.' },
              { n: '3', t: 'Certified Treatment', d: 'EPA-registered, family-safe products applied before your furniture arrives.' },
              { n: '4', t: 'Move In With Confidence', d: 'Documented inspection report and satisfaction guarantee.' },
            ].map(step => (
              <li key={step.n} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{step.t}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Sticky CTA block */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center space-y-4">
          <p className="font-extrabold text-slate-800 text-lg">
            🐛 Get a Free Pest Inspection Quote
          </p>
          <p className="text-sm text-slate-600">
            24/7 availability — local certified technicians — safe for kids &amp; pets.
          </p>
          <CallButton />
        </div>

        <p className="text-center text-sm text-slate-500">
          Already planned your move?{' '}
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            Calculate your moving cost →
          </Link>
        </p>
      </section>
    </>
  );
}
