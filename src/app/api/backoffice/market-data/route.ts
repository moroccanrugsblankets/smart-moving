import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { marketRatesStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';
import staticRates from '@/data/market_rates.json';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const data = (await marketRatesStore.get()) ?? staticRates;
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  await marketRatesStore.save(body);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'market-rates', 'Updated market rates');
  return NextResponse.json({ ok: true });
}
