import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartMoving.com — Free Moving & Cleaning Cost Estimator',
  description:
    'Get instant, accurate moving and cleaning cost estimates for any US city. Based on real 2026 market rates from U.S. Bureau of Labor Statistics data.',
  keywords: 'moving cost estimator, moving company prices, cleaning service cost, moving quotes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
