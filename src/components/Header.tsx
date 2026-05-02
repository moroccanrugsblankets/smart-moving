import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#1E40AF] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-yellow-300">📦</span> SmartMoving.com
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/#calculator" className="hover:text-yellow-300 transition-colors">
            Free Estimate
          </Link>
          <Link href="/moving-cost" className="hover:text-yellow-300 transition-colors">
            City Guides
          </Link>
          <Link href="/admin" className="hover:text-yellow-300 transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
