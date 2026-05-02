'use client';

import { useEffect, useState } from 'react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceDate: string;
  serviceType: string;
  originZip?: string;
  destZip?: string;
  homeSize?: string;
  estimate?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => { setLeads(data.leads || []); setLoading(false); });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Lead Management — SmartMoving.com</p>
        </div>
        <span className="bg-blue-100 text-[#1E40AF] text-sm font-bold px-4 py-2 rounded-full">
          {leads.length} Lead{leads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading leads…</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-slate-600 font-semibold">No leads yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Leads will appear here once users submit the form.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'Service', 'Estimate', 'Service Date', 'Submitted'].map(
                    h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-slate-600 font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full
                          ${lead.serviceType === 'moving'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'}`}
                      >
                        {lead.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                      {lead.estimate ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {lead.serviceDate}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-6 text-center">
        ⚠️ This dashboard has no authentication. Add middleware before going live.
      </p>
    </div>
  );
}
