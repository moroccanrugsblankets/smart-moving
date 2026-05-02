import Calculator from '@/components/Calculator';
import marketRates from '@/data/market_rates.json';
import Link from 'next/link';

export default function HomePage() {
  const featuredCities = marketRates.topCities.slice(0, 12);

  return (
    <>
      <section className="bg-gradient-to-br from-[#1E40AF] to-blue-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Public Utility Tool — Free to Use
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            How Much Does Moving Cost<br />
            <span className="text-yellow-300">in Your City?</span>
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">
            Get an instant, data-driven estimate for moving or cleaning services anywhere in the
            USA — based on 2026 market rates.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-300">
            <span>✅ No signup required</span>
            <span>✅ Instant results</span>
            <span>✅ Based on BLS data</span>
            <span>✅ 50 states covered</span>
          </div>
        </div>
      </section>

      <section id="calculator" className="max-w-xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <Calculator />
      </section>

      <section className="bg-white border-y border-slate-200 py-10 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-extrabold text-[#1E40AF]">500+</p>
            <p className="text-sm text-slate-600 mt-1">US Cities Covered</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1E40AF]">2026</p>
            <p className="text-sm text-slate-600 mt-1">Market Rate Data</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1E40AF]">50</p>
            <p className="text-sm text-slate-600 mt-1">States + DC</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
          Moving Cost Guides by City
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredCities.map(city => (
            <Link
              key={`${city.state}-${city.slug}`}
              href={`/moving-cost/${city.state.toLowerCase()}/${city.slug}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1E40AF] hover:shadow-md transition-all group"
            >
              <p className="font-semibold text-slate-800 group-hover:text-[#1E40AF] text-sm">
                {city.city}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{city.state} Moving Costs</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/moving-cost"
            className="inline-block bg-[#1E40AF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
          >
            View All Cities →
          </Link>
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">
            How Our Estimate Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📍',
                title: 'Enter Your Details',
                desc: 'Provide your origin/destination zip codes, home size, and moving complexity.',
              },
              {
                icon: '⚡',
                title: 'Instant Calculation',
                desc: 'Our engine applies real 2026 state-level cost-of-living multipliers to compute your range.',
              },
              {
                icon: '🤝',
                title: 'Get Guaranteed Quotes',
                desc: 'Connect with licensed, insured movers competing for your business.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
