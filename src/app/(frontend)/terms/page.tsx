import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — GetMoveCost.com',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Terms of Service</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: May 1, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">1. Use of the Tool</h2>
          <p>
            GetMoveCost.com provides cost estimation tools for informational purposes only.
            Estimates are not guaranteed prices.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">2. No Guarantee</h2>
          <p>
            Actual moving or cleaning costs may differ from estimates. GetMoveCost.com is not
            responsible for any discrepancy between the estimate and the actual price charged by a
            service provider.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">3. Third-Party Partners</h2>
          <p>
            By requesting quotes, you agree to be contacted by our partner moving companies.
            GetMoveCost.com is a lead generation platform and does not directly provide moving or
            cleaning services.
          </p>
        </section>
      </div>
    </div>
  );
}
