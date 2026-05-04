'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/backoffice', icon: '📊' },
  { label: 'Leads', href: '/backoffice/leads', icon: '👥' },
  { label: 'Blog', href: '/backoffice/blog', icon: '✍️' },
  { label: 'Blog Categories', href: '/backoffice/blog/categories', icon: '🏷️' },
  { label: 'Pages', href: '/backoffice/pages', icon: '📄' },
  { label: 'Market Data', href: '/backoffice/market-data', icon: '🗺️', roles: ['admin'] },
  { label: 'Settings', href: '/backoffice/settings', icon: '⚙️', roles: ['admin'] },
  { label: 'Users', href: '/backoffice/users', icon: '👤', roles: ['admin'] },
  { label: 'Email Config', href: '/backoffice/email/config', icon: '📧', roles: ['admin'] },
  { label: 'Email Templates', href: '/backoffice/email-templates', icon: '✉️', roles: ['admin'] },
  { label: 'Email Logs', href: '/backoffice/email/logs', icon: '📋' },
  { label: 'Activity Logs', href: '/backoffice/activity-logs', icon: '📜', roles: ['admin'] },
];

export default function BackofficeSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="w-56 bg-slate-900 flex flex-col flex-shrink-0 border-r border-slate-700 overflow-y-auto">
      <div className="px-4 py-5 border-b border-slate-700">
        <Link href="/backoffice" className="text-white font-bold text-lg">
          SmartMoving
        </Link>
        <p className="text-slate-500 text-xs mt-0.5">Backoffice</p>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map(item => {
            const isActive =
              item.href === '/backoffice'
                ? pathname === '/backoffice'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
