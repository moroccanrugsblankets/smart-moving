import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BackofficeSidebar from './Sidebar';

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/portal-access-secure');
  }

  const user = session.user as { id?: string; email?: string; name?: string; role?: string };

  return (
    <html lang="en">
      <body className="bg-slate-800 min-h-screen" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex h-screen overflow-hidden">
          <BackofficeSidebar role={user.role ?? 'manager'} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <h2 className="text-white font-semibold text-sm">Admin Backoffice</h2>
              <div className="flex items-center gap-3">
                <span className="text-slate-300 text-sm">
                  {user.name ?? user.email}
                  {user.role && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400 capitalize">
                      {user.role}
                    </span>
                  )}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </header>
            {/* Main content */}
            <main className="flex-1 overflow-auto p-6 bg-slate-800">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
