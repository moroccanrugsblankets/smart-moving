'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  estimate?: string;
  createdAt: string;
}

interface DayCount {
  date: string;
  count: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLast7Days(): DayCount[] {
  const days: DayCount[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }
  return days;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-slate-700 rounded-lg p-5">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blogCount, setBlogCount] = useState(0);
  const [chartData, setChartData] = useState<DayCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, blogRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/backoffice/blog'),
        ]);
        const leadsData = leadsRes.ok ? await leadsRes.json() : [];
        const blogData = blogRes.ok ? await blogRes.json() : [];

        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setBlogCount(Array.isArray(blogData) ? blogData.length : 0);

        // Build chart
        const days = getLast7Days();
        const allLeads: Lead[] = Array.isArray(leadsData) ? leadsData : [];
        const now = new Date();
        allLeads.forEach(l => {
          const d = new Date(l.createdAt);
          const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
          if (diffDays >= 0 && diffDays < 7) {
            days[6 - diffDays].count += 1;
          }
        });
        setChartData(days);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const leadsToday = leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
  const leadsThisMonth = leads.filter(l => {
    const d = new Date(l.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={leads.length} />
        <StatCard label="Leads Today" value={leadsToday} />
        <StatCard label="Leads This Month" value={leadsThisMonth} />
        <StatCard label="Blog Posts" value={blogCount} />
      </div>

      {/* Chart */}
      <div className="bg-slate-700 rounded-lg p-5">
        <h2 className="text-white font-semibold mb-4">Leads (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Leads */}
      <div className="bg-slate-700 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Leads</h2>
          <Link href="/backoffice/leads" className="text-blue-400 text-sm hover:text-blue-300">
            View all →
          </Link>
        </div>
        {leads.length === 0 ? (
          <p className="text-slate-400 text-sm">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-600">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Service</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map(lead => (
                  <tr key={lead.id} className="border-b border-slate-600/50 text-slate-300">
                    <td className="py-2 pr-4">{lead.firstName} {lead.lastName}</td>
                    <td className="py-2 pr-4">{lead.email}</td>
                    <td className="py-2 pr-4 capitalize">{lead.serviceType}</td>
                    <td className="py-2 text-slate-400">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-slate-700 rounded-lg p-5">
        <h2 className="text-white font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Leads', href: '/backoffice/leads', icon: '👥' },
            { label: 'Blog Posts', href: '/backoffice/blog', icon: '✍️' },
            { label: 'Pages', href: '/backoffice/pages', icon: '📄' },
            { label: 'Settings', href: '/backoffice/settings', icon: '⚙️' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 p-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-sm transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
