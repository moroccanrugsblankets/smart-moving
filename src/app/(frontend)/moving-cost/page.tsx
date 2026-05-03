import Link from 'next/link';
import marketRates from '@/data/market_rates.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moving Cost by City — GetMoveCost.com',
  description: 'Browse moving cost estimates for 100+ US cities based on real 2026 market data.',
};

export default function MovingCostIndexPage() {
  const byState: Record<string, typeof marketRates.topCities> = {};
  for (const city of marketRates.topCities) {
    if (!byState[city.state]) byState[city.state] = [];
    byState[city.state].push(city);
  }
  const sortedStates = Object.keys(byState).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Moving Cost by City</h1>
      <p className="text-slate-600 mb-10">
        Browse moving cost guides for top US cities. All estimates based on 2026 regional market rates.
      </p>
      <div className="space-y-10">
        {sortedStates.map(state => (
          <div key={state}>
            <h2 className="text-lg font-bold text-[#1E40AF] border-b border-slate-200 pb-2 mb-4">
              {(marketRates.stateMultipliers as Record<string, { name: string }>)[state]?.name ?? state}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {byState[state].map(city => (
                <Link
                  key={city.slug}
                  href={`/moving-cost/${state.toLowerCase()}/${city.slug}`}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:border-[#1E40AF] hover:shadow-sm transition-all text-sm group"
                >
                  <span className="font-medium text-slate-800 group-hover:text-[#1E40AF]">
                    {city.city}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
