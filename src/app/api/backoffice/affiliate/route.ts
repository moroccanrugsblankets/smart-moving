import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { settingsStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const settings = await settingsStore.get();
  return NextResponse.json({
    affiliatePhone: settings.affiliatePhone ?? '1-844-578-3057',
    affiliateTitle: settings.affiliateTitle ?? 'Moving Into a New House?',
    affiliateDescription: settings.affiliateDescription ?? "Don't let unexpected repairs or lock issues ruin your moving day. Get a certified local technician to secure your new home immediately.",
    affiliateButtonText: settings.affiliateButtonText ?? 'Call Our 24/7 Hotline:',
    affiliateFooterText: settings.affiliateFooterText ?? 'Free Quotes & Immediate Availability Verification',
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { affiliatePhone, affiliateTitle, affiliateDescription, affiliateButtonText, affiliateFooterText } = await req.json();
  const settings = await settingsStore.get();
  await settingsStore.save({
    ...settings,
    affiliatePhone: affiliatePhone ?? settings.affiliatePhone,
    affiliateTitle: affiliateTitle ?? settings.affiliateTitle,
    affiliateDescription: affiliateDescription ?? settings.affiliateDescription,
    affiliateButtonText: affiliateButtonText ?? settings.affiliateButtonText,
    affiliateFooterText: affiliateFooterText ?? settings.affiliateFooterText,
  });
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'affiliate', 'Updated affiliate CTA settings');
  return NextResponse.json({ ok: true });
}
