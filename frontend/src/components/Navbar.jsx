import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function BrandMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f2f8ff_100%)] p-1.5 shadow-soft"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EA9FF" />
          <stop offset="100%" stopColor="#2F80ED" />
        </linearGradient>
      </defs>
      <path
        d="M24 6c7.5 0 13.5 2.4 13.5 5.4V24c0 8.1-5.8 15.1-13.5 17.8C16.3 39.1 10.5 32.1 10.5 24V11.4C10.5 8.4 16.5 6 24 6Z"
        fill="url(#mark-gradient)"
      />
      <path d="M24 14v16M16 22h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] text-white shadow-[0_12px_24px_-16px_rgba(30,103,197,0.85)]"
        : "text-slate-600 hover:bg-white hover:text-medical-primary"
    }`;

  return (
    <header className="animate-reveal-soft fixed inset-x-0 top-0 z-30 px-2 pt-2 sm:px-4">
      <div className="glass-surface premium-outline mx-auto flex h-20 w-full max-w-7xl items-center justify-between rounded-2xl border border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="interactive-lift flex items-center gap-3 rounded-2xl px-2 py-1">
          <BrandMark />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-medical-primary">
              MedInsight AI
            </p>
            <p className="text-base font-bold text-slate-800">
              Smart Clinical Decision Support
            </p>
          </div>
        </Link>

        <nav className="interactive-lift no-scrollbar flex max-w-[55vw] items-center gap-2 overflow-x-auto rounded-full border border-blue-100 bg-[linear-gradient(135deg,#f6fbff_0%,#eaf5ff_100%)] p-1.5 sm:max-w-none">
          {isAuthenticated ? (
            <>
              <NavLink to="/app/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-medical-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/login" className={linkClass}>
                Sign In
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
