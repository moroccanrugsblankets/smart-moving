import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="text-yellow-300 text-2xl">📦</span>
          <span><span className="text-yellow-300">Get</span>Move<span className="text-yellow-300">Cost</span>.com</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/moving-cost"
            className="hover:text-yellow-300 transition-colors"
          >
            City Guides
          </Link>
          <Link
            href="/#calculator"
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-4 py-2 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-md"
          >
            Get Free Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
