import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { TOKEN_STORAGE_KEY } from "../api/client.js";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const hasStoredToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-medical-ice">
        <div className="rounded-3xl border border-blue-100 bg-white px-8 py-6 shadow-soft">
          <p className="text-sm font-semibold text-slate-600">
            Verifying hospital session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !hasStoredToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}
