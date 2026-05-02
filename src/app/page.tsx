import Calculator from '@/components/Calculator';
import marketRates from '@/data/market_rates.json';
import Link from 'next/link';

export default function HomePage() {
  const featuredCities = marketRates.topCities.slice(0, 12);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Public Utility Tool — Free to Use
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            How Much Does Moving Cost<br />
            <span className="text-yellow-300">in Your City?</span>
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Get an instant, data-driven estimate for moving or cleaning services anywhere in the
            USA — based on 2026 market rates.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              'No signup required',
              'Instant results',
              'Based on BLS data',
              '50 states covered',
            ].map(badge => (
              <span key={badge} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-blue-100 px-3 py-1.5 rounded-full border border-white/20">
                <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section id="calculator" className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <Calculator />
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-y border-slate-200 py-10 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-0 divide-x divide-slate-200 text-center">
          {[
            {
              value: '500+',
              label: 'US Cities Covered',
              icon: (
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              value: '2026',
              label: 'Market Rate Data',
              icon: (
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              value: '50',
              label: 'States + DC',
              icon: (
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map(stat => (
            <div key={stat.label} className="px-6 py-2">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-3xl font-extrabold text-blue-700">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── City guides ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
          Moving Cost Guides by City
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredCities.map(city => (
            <Link
              key={`${city.state}-${city.slug}`}
              href={`/moving-cost/${city.state.toLowerCase()}/${city.slug}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-600 hover:shadow-md transition-all group"
            >
              <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm">
                {city.city}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{city.state} Moving Costs</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/moving-cost"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 shadow-md"
          >
            View All Cities →
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-100 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">
            How Our Estimate Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Enter Your Details',
                desc: 'Provide your origin/destination zip codes, home size, and moving complexity.',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Calculation',
                desc: 'Our engine applies real 2026 state-level cost-of-living multipliers to compute your range.',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Get Guaranteed Quotes',
                desc: 'Connect with licensed, insured movers competing for your business.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-slate-400 leading-relaxed">
          Cost estimates are calculated using base rates from the U.S. Bureau of Labor Statistics
          Occupational Employment and Wage Statistics (OEWS) program, adjusted with regional
          cost-of-living indices for 2026. Estimates are ranges and actual costs may vary based on
          specific conditions, seasonality, and individual company pricing.
        </p>
      </section>
    </>
  );
}
