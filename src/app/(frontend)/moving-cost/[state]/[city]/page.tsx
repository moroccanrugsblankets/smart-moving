import { notFound } from 'next/navigation';
import marketRates from '@/data/market_rates.json';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import Link from 'next/link';

interface Props {
  params: Promise<{ state: string; city: string }>;
}

function findCity(stateSlug: string, citySlug: string) {
  return marketRates.topCities.find(
    c => c.state.toLowerCase() === stateSlug.toLowerCase() && c.slug === citySlug,
  );
}

export async function generateStaticParams() {
  return marketRates.topCities.map(c => ({
    state: c.state.toLowerCase(),
    city:  c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await params;
  const cityData = findCity(state, city);
  if (!cityData) return {};
  const stateData = (marketRates.stateMultipliers as Record<string, { multiplier: number }>)[cityData.state];
  const multiplier  = stateData?.multiplier ?? 1.0;
  const baseMoving  = Math.round(marketRates.baseRates.moving.hourlyRate * 8 * multiplier);
  return {
    title: `Moving Cost in ${cityData.city}, ${cityData.state} (2026) — GetMoveCost.com`,
    description: `How much does it cost to move in ${cityData.city}, ${cityData.state}? Average moving costs start around $${baseMoving.toLocaleString()} for a 2-bedroom in 2026. Get your free estimate.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { state, city } = await params;
  const cityData = findCity(state, city);
  if (!cityData) notFound();

  const stateData  = (marketRates.stateMultipliers as Record<string, { name: string; multiplier: number }>)[cityData.state];
  const multiplier = stateData?.multiplier ?? 1.0;

  const studio  = Math.round(marketRates.volumeConstants.studio.hours * marketRates.baseRates.moving.hourlyRate * multiplier + marketRates.baseRates.gasSurcharge);
  const twoBr   = Math.round(marketRates.volumeConstants['2br'].hours  * marketRates.baseRates.moving.hourlyRate * multiplier + 30 * marketRates.baseRates.distanceSurchargePerMile + marketRates.baseRates.gasSurcharge);
  const threeBr = Math.round(marketRates.volumeConstants['3br'].hours  * marketRates.baseRates.moving.hourlyRate * multiplier + 50 * marketRates.baseRates.distanceSurchargePerMile + marketRates.baseRates.gasSurcharge);

  const costTable = [
    { size: 'Studio',      low: Math.round(studio  * 0.9), high: Math.round(studio  * 1.1) },
    { size: '1 Bedroom',   low: Math.round(studio  * 1.4 * 0.9), high: Math.round(studio * 1.4 * 1.1) },
    { size: '2 Bedrooms',  low: Math.round(twoBr   * 0.9), high: Math.round(twoBr   * 1.1) },
    { size: '3 Bedrooms',  low: Math.round(threeBr * 0.9), high: Math.round(threeBr * 1.1) },
    { size: '4+ Bedrooms', low: Math.round(threeBr * 1.4 * 0.9), high: Math.round(threeBr * 1.4 * 1.1) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-xs text-slate-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-[#1E40AF]">Home</Link>
        <span>/</span>
        <Link href="/moving-cost" className="hover:text-[#1E40AF]">Moving Cost</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{cityData.city}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Moving Cost in {cityData.city}, {cityData.state} (2026)
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Planning a move in <strong>{cityData.city}</strong>? Based on 2026 market data and{' '}
            {stateData ? `${stateData.name}'s` : ''} regional cost-of-living index
            ({multiplier.toFixed(2)}× national baseline), here are the average moving costs you
            can expect to pay.
          </p>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-10 shadow-sm">
            <div className="bg-[#1E40AF] text-white px-6 py-3">
              <h2 className="font-bold text-sm">
                Average Moving Costs in {cityData.city}, {cityData.state}
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-slate-600 font-semibold">Home Size</th>
                  <th className="text-right px-6 py-3 text-slate-600 font-semibold">Low Estimate</th>
                  <th className="text-right px-6 py-3 text-slate-600 font-semibold">High Estimate</th>
                </tr>
              </thead>
              <tbody>
                {costTable.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-3 font-medium text-slate-800">{row.size}</td>
                    <td className="px-6 py-3 text-right text-slate-700">${row.low.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-semibold text-[#1E40AF]">${row.high.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-50 px-6 py-3 text-xs text-slate-400 border-t border-slate-200">
              Estimates based on 2 movers + truck, local move (under 50 miles). Source: U.S. BLS OEWS 2026.
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-4">
            What Factors Affect Moving Costs in {cityData.city}?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: '📏',
                title: 'Distance',
                desc: `Local moves in ${cityData.city} are charged hourly. Long-distance moves add $1.50/mile.`,
              },
              {
                icon: '🏠',
                title: 'Home Size',
                desc: 'More rooms = more items = more time. A studio takes ~3 hours; a 3BR takes ~12 hours.',
              },
              {
                icon: '🏗️',
                title: 'Complexity',
                desc: 'Stairs, elevators, piano moving, and long carries add 8–20% to the base cost.',
              },
              {
                icon: '📅',
                title: 'Timing',
                desc: 'Summer (Jun–Aug) and month-end moves cost 15–30% more due to high demand.',
              },
            ].map(f => (
              <div key={f.title} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-4 self-start">
          <p className="text-sm font-semibold text-slate-600 mb-3 text-center">
            Get your personalized estimate for {cityData.city}:
          </p>
          <Calculator />
        </div>
      </div>
    </div>
  );
}
