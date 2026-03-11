import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { BarChart3, ClipboardList, Home, LogOut, Stethoscope } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/app/dashboard", icon: Home },
  { label: "Predict Patient Risk", to: "/app/predict", icon: Stethoscope },
  { label: "Patient History", to: "/app/history", icon: ClipboardList },
  { label: "Analytics", to: "/app/analytics", icon: BarChart3 },
];

export function AppShell() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-medical-ice">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_9%_18%,rgba(30,136,229,0.2),transparent_36%),radial-gradient(circle_at_90%_5%,rgba(91,192,255,0.18),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(136,191,255,0.16),transparent_36%),linear-gradient(180deg,#f9fbfe_0%,#f3f8ff_100%)]" />
      <div className="drift-glow pointer-events-none fixed -left-16 top-20 h-44 w-44 rounded-full bg-cyan-200/55 blur-3xl" />
      <div className="drift-glow pointer-events-none fixed bottom-20 right-[-2rem] h-56 w-56 rounded-full bg-blue-200/55 blur-3xl" />

      <div className="relative min-h-screen">
        <header className="sticky top-0 z-30 px-2 pt-2 sm:px-4">
          <div className="glass-surface premium-outline mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100/90 px-3 py-3 sm:px-5">
            <Link
              to="/app/dashboard"
              className="interactive-lift rounded-xl px-2 py-1 transition hover:bg-white/80"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-medical-primary">
                MedInsight AI
              </p>
              <h1 className="text-lg font-semibold text-slate-800">
                Smart Clinical Decision Support
              </h1>
            </Link>

            <nav className="shimmer-line no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-blue-100/85 bg-[linear-gradient(135deg,#f6fbff_0%,#ebf5ff_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] text-white shadow-[0_14px_24px_-16px_rgba(30,103,197,0.8)]"
                          : "text-slate-600 hover:bg-white hover:text-medical-primary"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <span className="absolute inset-x-2 -bottom-[2px] h-[2px] scale-x-0 rounded-full bg-white/70 opacity-0 transition duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {user?.name || user?.email || "Hospital Staff"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="interactive-lift inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-medical-primary hover:text-medical-primary"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-4 sm:px-6">
          <div className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
