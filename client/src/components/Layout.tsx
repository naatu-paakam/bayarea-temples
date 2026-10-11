import { Link, NavLink, Outlet } from 'react-router-dom';
import { REVIEW_DISCLAIMER } from '../data/temples';

const nav = [
  { to: '/temples', label: 'Temples' },
  { to: '/deities', label: 'Deities' },
  { to: '/festivals', label: 'Festivals' },
  { to: '/blog', label: 'Blog' },
  { to: '/plan', label: 'My Visit' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#f0e2cc]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-maroon text-xl">
            <span aria-hidden>🪔</span> Bay Area Temples
          </Link>
          <nav className="hidden md:flex gap-5 text-[15px]">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  isActive ? 'text-maroon font-bold' : 'text-ink hover:text-maroon'
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <nav className="md:hidden flex gap-3 text-sm overflow-x-auto">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => (isActive ? 'text-maroon font-bold' : 'text-ink')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[#f0e2cc] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted">
          <p className="font-bold text-ink mb-1">🪔 Bay Area Temples</p>
          <p>A devotee-built directory of Hindu temples across the San Francisco Bay Area.</p>
          <p className="mt-2">{REVIEW_DISCLAIMER}</p>
          <p className="mt-2">Timings change — please confirm with the temple before visiting. Shubh Navarathri!</p>
        </div>
      </footer>
    </div>
  );
}
