import type { Metadata } from 'next';
import Link from 'next/link';

// ── Update this number to change the tracking phone across the whole page ──
const PLUMBING_PHONE_DISPLAY = '1-855-730-1575';
const PLUMBING_PHONE_TEL = '18557301575';

export const metadata: Metadata = {
  title: 'Plumbing Inspection for Movers — New Home Hookup | GetMoveCost.com',
  description:
    'Moving in? Get a professional plumbing inspection, water heater check, and appliance hookup before unpacking. Free quote — 24/7 licensed local plumbers.',
  keywords:
    'plumbing inspection new home, appliance hookup moving in, washer hookup plumber, water heater check moving, moving plumbing services',
};

const TRUST_BADGES = [
  { icon: '🕐', label: '24/7 Local Pros' },
  { icon: '💬', label: 'Free Quote' },
  { icon: '✅', label: '100% Safe for Families' },
];

const PLUMBING_SERVICES = [
  { icon: '💧', name: 'Leak Detection', desc: 'Pressure tests on all supply and drain lines' },
  { icon: '🔥', name: 'Water Heater Check', desc: 'Inspect age, anode rod, pressure relief valve' },
  { icon: '🫧', name: 'Washer Hookup', desc: 'Professional connection of hoses and drain lines' },
  { icon: '🍽️', name: 'Dishwasher Hookup', desc: 'Water supply, drain, and power connections' },
  { icon: '🚿', name: 'Fixture Inspection', desc: 'Test all faucets, toilets, showers, and tubs' },
  { icon: '🚰', name: 'Shut-Off Valves', desc: 'Locate and verify all emergency shut-offs work' },
];

function CallButton() {
  return (
    <a
      href={`tel:${PLUMBING_PHONE_TEL}`}
      className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-5 px-6 rounded-full shadow-xl text-lg transition-all active:scale-95"
    >
      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.26.2 2.47.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
      </svg>
      Call Now — {PLUMBING_PHONE_DISPLAY}
    </a>
  );
}

export default function MovingPlumbingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-cyan-800 text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-white/25">
            🏠 Moving Checklist — Step 2
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Moving In? Get Your New Home&apos;s Plumbing Checked &amp; Connected Today!
          </h1>
          <p className="text-base text-blue-100 leading-relaxed max-w-xl mx-auto">
            Hidden leaks can cause{' '}
            <strong className="text-white">thousands in water damage</strong> within days. Book a
            full plumbing inspection and get your appliances hooked up{' '}
            <em>before moving day</em> — not after.
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
            <p className="text-xs text-blue-200 mt-2">
              Free quotes — no obligation. Immediate availability verification.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why now ── */}
      <section className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-5">
          <p className="font-bold text-slate-800 mb-1">⚠️ Check your pipes before unpacking!</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            A slow leak behind the walls of an empty home can go unnoticed for weeks. Once your
            belongings are in, water damage from a burst supply line or faulty water heater becomes
            exponentially more costly. A pre-move-in plumbing inspection takes{' '}
            <strong>under 2 hours</strong> and can save you tens of thousands in repairs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-5">
            What&apos;s Included in a Pre-Move-In Plumbing Inspection
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PLUMBING_SERVICES.map(s => (
              <div
                key={s.name}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-4">How It Works</h2>
          <ol className="space-y-3">
            {[
              { n: '1', t: 'Call Our 24/7 Hotline', d: 'A local licensed plumber is dispatched — free estimate, no surprise fees.' },
              { n: '2', t: 'Schedule Around Your Move', d: 'Same-day and next-day slots available, including weekends.' },
              { n: '3', t: 'Full Inspection & Hookup', d: 'We test every line, connect your appliances, and hand you a written report.' },
              { n: '4', t: 'Move In Worry-Free', d: 'Know your plumbing is solid before the first box crosses the threshold.' },
            ].map(step => (
              <li key={step.n} className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
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
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 text-center space-y-4">
          <p className="font-extrabold text-slate-800 text-lg">
            🔧 Get a Free Plumbing Inspection Quote
          </p>
          <p className="text-sm text-slate-600">
            24/7 availability — licensed local plumbers — appliance hookups included.
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
