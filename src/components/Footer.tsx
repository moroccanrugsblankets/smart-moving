import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-white mb-2">SmartMoving.com</p>
          <p className="text-xs leading-relaxed">
            Cost estimates are based on U.S. Bureau of Labor Statistics data and regional market
            surveys (2026). Actual prices may vary.
          </p>
        </div>
        <div>
          <p className="font-bold text-white mb-2">Quick Links</p>
          <ul className="space-y-1 text-xs">
            <li>
              <Link href="/moving-cost" className="hover:text-white">Moving Cost by City</Link>
            </li>
            <li>
              <Link href="/#calculator" className="hover:text-white">Free Estimate Tool</Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">Admin Dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white mb-2">Legal</p>
          <ul className="space-y-1 text-xs">
            <li>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/do-not-sell" className="hover:text-white">
                Do Not Sell My Personal Information (CCPA)
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-700 text-center py-4 text-xs text-slate-500">
        © 2026 SmartMoving.com. All rights reserved. |{' '}
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
