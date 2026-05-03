import { MetadataRoute } from 'next';
import marketRates from '@/data/market_rates.json';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://getmovecost.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const cityRoutes: MetadataRoute.Sitemap = marketRates.topCities.map(city => ({
    url:              `${BASE_URL}/moving-cost/${city.state.toLowerCase()}/${city.slug}`,
    lastModified:     new Date('2026-05-01'),
    changeFrequency:  'monthly',
    priority:         0.8,
  }));

  return [
    { url: BASE_URL,                  lastModified: new Date('2026-05-01'), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/moving-cost`, lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.9 },
    ...cityRoutes,
  ];
}
