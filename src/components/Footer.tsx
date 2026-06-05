import Link from 'next/link';
import { pagesStore, footerSettingsStore, type FooterLink } from '@/lib/fileStore';

const DEFAULT_DESCRIPTION =
  'Cost estimates are based on U.S. Bureau of Labor Statistics data and regional market surveys (2026). Actual prices may vary.';

const DEFAULT_QUICK_LINKS = [
  { href: '/moving-cost', label: 'Moving Cost by City' },
  { href: '/#calculator', label: 'Free Estimate Tool' },
];

const DEFAULT_LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/do-not-sell', label: 'Do Not Sell My Personal Information (CCPA)' },
  { href: '/terms', label: 'Terms of Service' },
];

async function getFooterData() {
  try {
    const [pages, footerSettings] = await Promise.all([
      pagesStore.getAll(),
      footerSettingsStore.get(),
    ]);

    const footerPages = pages
      .filter(p => p.showInFooter)
      .sort((a, b) => a.footerOrder - b.footerOrder)
      .map(p => ({ href: `/${p.slug}`, label: p.title }));

    const quickLinks = (footerSettings.quickLinks ?? [])
      .map(link => ({ href: link.url, label: link.label }))
      .filter(link => link.href && link.label);
    const customLinks: FooterLink[] = footerSettings.customLinks ?? [];
    const allLegalLinks = [
      ...footerPages,
      ...customLinks.map(l => ({ href: l.url, label: l.label })),
    ];

    return {
      description: footerSettings.description,
      quickLinks: quickLinks.length > 0 ? quickLinks : DEFAULT_QUICK_LINKS,
      legalLinks: allLegalLinks,
    };
  } catch {
    return {
      description: DEFAULT_DESCRIPTION,
      quickLinks: DEFAULT_QUICK_LINKS,
      legalLinks: DEFAULT_LEGAL_LINKS,
    };
  }
}

export default async function Footer() {
  const { description, quickLinks, legalLinks } = await getFooterData();

  return (
    <div style="font-size: 11px; color: #666666; line-height: 1.4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
    <p><strong>Disclaimer:</strong> GetMoveCost.com is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and this site does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on this site.</p>
    <p style="margin-top: 5px;">Same-day and 24/7 emergency services are subject to provider participation, location, technician availability, and demand. Availability is not guaranteed and may vary by market and appointment capacity.</p>
</div>
    <footer className="bg-slate-800 text-slate-300 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-white mb-2">GetMoveCost.com</p>
          <p className="text-xs leading-relaxed">{description}</p>
        </div>
        <div>
          <p className="font-bold text-white mb-2">Quick Links</p>
          <ul className="space-y-1 text-xs">
            {quickLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        {legalLinks.length > 0 && (
          <div>
            <p className="font-bold text-white mb-2">Legal</p>
            <ul className="space-y-1 text-xs">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-slate-700 text-center py-4 text-xs text-slate-500">
        © 2026 GetMoveCost.com. All rights reserved. |{' '}
        <a
          href="https://www.bls.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Data Source: U.S. BLS
        </a>
      </div>
    </footer>
  );
}
