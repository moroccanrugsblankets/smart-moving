import { NextResponse } from 'next/server';
import { settingsStore } from '@/lib/fileStore';

export async function GET() {
  try {
    const settings = await settingsStore.get();
    return NextResponse.json({
      affiliatePhone: settings.affiliatePhone ?? '1-844-578-3057',
      affiliateTitle: settings.affiliateTitle ?? 'Moving Into a New House?',
      affiliateDescription: settings.affiliateDescription ?? "Don't let unexpected repairs or lock issues ruin your moving day. Get a certified local technician to secure your new home immediately.",
      affiliateButtonText: settings.affiliateButtonText ?? 'Call Our 24/7 Hotline:',
      affiliateFooterText: settings.affiliateFooterText ?? 'Free Quotes & Immediate Availability Verification',
    });
  } catch {
    return NextResponse.json({
      affiliatePhone: '1-844-578-3057',
      affiliateTitle: 'Moving Into a New House?',
      affiliateDescription: "Don't let unexpected repairs or lock issues ruin your moving day. Get a certified local technician to secure your new home immediately.",
      affiliateButtonText: 'Call Our 24/7 Hotline:',
      affiliateFooterText: 'Free Quotes & Immediate Availability Verification',
    });
  }
}
