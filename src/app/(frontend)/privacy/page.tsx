import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — GetMoveCost.com',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: May 1, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">1. Information We Collect</h2>
          <p className="text-slate-600">
            We collect information you provide when requesting cost estimates, including name, email,
            phone number, service address, and moving date.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">2. How We Use Your Information</h2>
          <p className="text-slate-600">
            Your information is used to provide cost estimates and connect you with licensed moving
            and cleaning service providers. We may share your data with affiliate partners to deliver
            competitive quotes.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">3. TCPA Consent</h2>
          <p className="text-slate-600">
            By submitting a quote request, you consent to receive calls and/or SMS from
            GetMoveCost.com and affiliated partners. Standard message and data rates may apply.
            Consent is not a condition of purchase.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">4. CCPA Rights</h2>
          <p className="text-slate-600">
            California residents may request to know, delete, or opt out of the sale of their
            personal information. See our{' '}
            <a href="/do-not-sell" className="text-[#1E40AF] underline">Do Not Sell</a> page.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">5. Contact</h2>
          <p className="text-slate-600">For privacy inquiries: privacy@getmovecost.com</p>
        </section>
      </div>
    </div>
  );
}
