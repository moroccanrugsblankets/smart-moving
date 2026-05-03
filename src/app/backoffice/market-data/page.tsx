'use client';

import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';

interface MarketRates {
  baseRates: {
    moving: { hourlyRate: number; description: string };
    cleaning: { perSqFt: number; fixedServiceFee: number; description: string };
    distanceSurchargePerMile: number;
    gasSurcharge: number;
  };
  volumeConstants: Record<string, { hours: number; weightLbs: number; label: string }>;
  stateMultipliers: Record<string, { name: string; multiplier: number }>;
  topCities?: string[];
}

interface BaseRateFlat {
  moving: { hourlyRate: number; description: string };
  cleaning: { perSqFt: number; fixedServiceFee: number; description: string };
  distanceSurchargePerMile: number;
  gasSurcharge: number;
}

/** Read a nested baseRates value by path (length 2 or 3). */
function getBaseRate(br: BaseRateFlat, path: string[]): number {
  if (path.length === 3) {
    const sub = br[path[1] as keyof BaseRateFlat];
    if (sub && typeof sub === 'object') return (sub as unknown as Record<string, number>)[path[2]] ?? 0;
  }
  return (br as unknown as Record<string, number>)[path[1]] ?? 0;
}

/** Write a nested baseRates value by path (length 2 or 3). Returns new baseRates object. */
function setBaseRate(br: BaseRateFlat, path: string[], val: number): BaseRateFlat {
  const next: BaseRateFlat = JSON.parse(JSON.stringify(br)) as BaseRateFlat;
  if (path.length === 3) {
    const sub = next[path[1] as keyof BaseRateFlat];
    if (sub && typeof sub === 'object') (sub as unknown as Record<string, number>)[path[2]] = val;
  } else {
    (next as unknown as Record<string, number>)[path[1]] = val;
  }
  return next;
}

type TabId = 'base' | 'states' | 'cities' | 'volume';

export default function MarketDataPage() {
  const [data, setData] = useState<MarketRates | null>(null);
  const [tab, setTab] = useState<TabId>('base');
  const [saving, setSaving] = useState(false);
  const [newCity, setNewCity] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetch('/api/backoffice/market-data')
      .then(r => r.json())
      .then(setData)
      .catch(() => addToast('Failed to load market data', 'error'));
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/backoffice/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) addToast('Market data saved');
      else addToast('Failed to save', 'error');
    } catch {
      addToast('Error saving', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="text-slate-400 p-8">Loading…</div>;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'base', label: 'Base Rates' },
    { id: 'states', label: 'State Multipliers' },
    { id: 'cities', label: 'Cities' },
    { id: 'volume', label: 'Volume Constants' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Market Data Editor</h1>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-700 rounded-lg p-6">
        {tab === 'base' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-white font-semibold">Base Rates</h2>
            {[
              { label: 'Moving Hourly Rate ($)', key: ['baseRates', 'moving', 'hourlyRate'] },
              { label: 'Cleaning Per Sq Ft ($)', key: ['baseRates', 'cleaning', 'perSqFt'] },
              { label: 'Cleaning Fixed Service Fee ($)', key: ['baseRates', 'cleaning', 'fixedServiceFee'] },
              { label: 'Distance Surcharge Per Mile ($)', key: ['baseRates', 'distanceSurchargePerMile'] },
              { label: 'Gas Surcharge ($)', key: ['baseRates', 'gasSurcharge'] },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-slate-400 text-sm mb-1">{field.label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={getBaseRate(data.baseRates, field.key)}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setData(prev => {
                      if (!prev) return prev;
                      return { ...prev, baseRates: setBaseRate(prev.baseRates, field.key, val) };
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'states' && (
          <div>
            <h2 className="text-white font-semibold mb-4">State Multipliers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800">
                  <tr className="text-slate-400">
                    <th className="text-left px-4 py-2">Code</th>
                    <th className="text-left px-4 py-2">State</th>
                    <th className="text-left px-4 py-2">Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.stateMultipliers).map(([code, info]) => (
                    <tr key={code} className="border-t border-slate-600 text-slate-300">
                      <td className="px-4 py-2 font-mono">{code}</td>
                      <td className="px-4 py-2">{info.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={info.multiplier}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setData(prev => {
                              if (!prev) return prev;
                              const next = JSON.parse(JSON.stringify(prev)) as MarketRates;
                              next.stateMultipliers[code].multiplier = val;
                              return next;
                            });
                          }}
                          className="w-24 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'cities' && (
          <div>
            <h2 className="text-white font-semibold mb-4">Top Cities</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="City name"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (!newCity.trim()) return;
                  setData(prev => {
                    if (!prev) return prev;
                    return { ...prev, topCities: [...(prev.topCities ?? []), newCity.trim()] };
                  });
                  setNewCity('');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                Add City
              </button>
            </div>
            <div className="space-y-2">
              {(data.topCities ?? []).map((city, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                  <span className="text-slate-300 text-sm">{city}</span>
                  <button
                    onClick={() => setData(prev => {
                      if (!prev) return prev;
                      return { ...prev, topCities: prev.topCities?.filter((_, j) => j !== i) };
                    })}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(data.topCities ?? []).length === 0 && (
                <p className="text-slate-400 text-sm">No cities configured.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'volume' && (
          <div>
            <h2 className="text-white font-semibold mb-4">Volume Constants</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800">
                  <tr className="text-slate-400">
                    <th className="text-left px-4 py-2">Home Size</th>
                    <th className="text-left px-4 py-2">Label</th>
                    <th className="text-left px-4 py-2">Hours</th>
                    <th className="text-left px-4 py-2">Weight (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.volumeConstants).map(([key, vol]) => (
                    <tr key={key} className="border-t border-slate-600 text-slate-300">
                      <td className="px-4 py-2 font-mono">{key}</td>
                      <td className="px-4 py-2">{vol.label}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={vol.hours}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setData(prev => {
                              if (!prev) return prev;
                              const next = JSON.parse(JSON.stringify(prev)) as MarketRates;
                              next.volumeConstants[key].hours = val;
                              return next;
                            });
                          }}
                          className="w-20 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={vol.weightLbs}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setData(prev => {
                              if (!prev) return prev;
                              const next = JSON.parse(JSON.stringify(prev)) as MarketRates;
                              next.volumeConstants[key].weightLbs = val;
                              return next;
                            });
                          }}
                          className="w-28 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
