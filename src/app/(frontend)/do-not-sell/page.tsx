import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Do Not Sell My Personal Information — GetMoveCost.com',
};

export default function DoNotSellPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-6">
        Do Not Sell My Personal Information
      </h1>
      <p className="text-slate-600 mb-4">
        Under the California Consumer Privacy Act (CCPA), California residents have the right to
        opt out of the sale of their personal information.
      </p>
      <p className="text-slate-600 mb-4">
        GetMoveCost.com may share lead information with affiliated moving service partners. If you
        are a California resident and wish to opt out, please contact us:
      </p>
      <div className="bg-slate-100 rounded-xl p-6 text-slate-700 text-sm space-y-2">
        <p><strong>Email:</strong> privacy@getmovecost.com</p>
        <p><strong>Subject:</strong> CCPA Opt-Out Request</p>
      </div>
      <p className="text-slate-500 text-sm mt-6">
        We will process your request within 15 business days as required by CCPA.
      </p>
    </div>
  );
}
