import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { ThinkstackChatbot } from "./components/ThinkstackChatbot.jsx";
import { Analytics } from "./pages/Analytics.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { History } from "./pages/History.jsx";
import { Landing } from "./pages/Landing.jsx";
import { Login } from "./pages/Login.jsx";
import { Predict } from "./pages/Predict.jsx";
import { Results } from "./pages/Results.jsx";

function LegacyLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-medical-ice text-slate-700">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(47,128,237,0.2),transparent_42%),radial-gradient(circle_at_88%_6%,rgba(29,211,176,0.16),transparent_34%),radial-gradient(circle_at_78%_78%,rgba(111,168,255,0.18),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)]" />
      <Navbar />
      <main className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LegacyLayout />}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <Predict />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="predict" element={<Predict />} />
          <Route path="results" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ThinkstackChatbot />
    </>
  );
}
