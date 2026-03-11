import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck, UserPlus2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const roleOptions = ["Doctor", "Admin", "Nurse"];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const isSignupPath = location.pathname === "/signup";
  const initialMode = isSignupPath ? "signup" : "signin";
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signInForm, setSignInForm] = useState({
    role: "Doctor",
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    role: "Doctor",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMode(isSignupPath ? "signup" : "signin");
  }, [isSignupPath]);

  const activeTitle = useMemo(
    () => (mode === "signin" ? "Sign In to Continue" : "Create Staff Account"),
    [mode]
  );

  function updateSignInField(event) {
    const { name, value } = event.target;
    setSignInForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateSignUpField(event) {
    const { name, value } = event.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    navigate(nextMode === "signin" ? "/login" : "/signup", { replace: true });
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setIsSubmitting(true);
      await login({
        email: signInForm.email,
        password: signInForm.password,
      });
      const from = location.state?.from || "/app/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        "Sign in failed. Please verify your credentials.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: signUpForm.name,
        role: signUpForm.role,
        email: signUpForm.email,
        password: signUpForm.password,
      });
      setSuccess("Account created successfully. Redirecting to dashboard...");
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        "Sign up failed. Please try another email.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fcfdff_100%)] px-4 py-3 text-slate-800 outline-none transition focus:border-medical-primary focus:ring-4 focus:ring-medical-primary/20";

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-medical-ice px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-12 top-8 h-44 w-44 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-blue-200/65 blur-3xl" />

      <div className="relative mx-auto max-w-5xl animate-page-enter">
        <Link
          to="/"
          className="interactive-lift inline-flex rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-medical-primary hover:text-medical-primary"
        >
          Back to Home
        </Link>

        <div className="glass-surface premium-outline mt-5 grid gap-6 rounded-[2rem] border border-blue-100 p-5 shadow-card backdrop-blur lg:grid-cols-[1fr_1.1fr] lg:p-8">
          <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-[linear-gradient(145deg,#f8fcff_0%,#e8f5ff_100%)] p-6">
            <div className="pointer-events-none absolute -right-5 -top-8 h-24 w-24 rounded-full bg-white/70 blur-2xl" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-medical-primary">
              Hospital Access
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{activeTitle}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Secure portal for hospital staff to run readmission predictions and
              review analytics dashboards.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure JWT Session
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5faff_100%)] p-1.5">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "signin"
                    ? "bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] text-white shadow-soft"
                    : "text-slate-600 hover:bg-medical-surface"
                }`}
              >
                <LockKeyhole className="h-4 w-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] text-white shadow-soft"
                    : "text-slate-600 hover:bg-medical-surface"
                }`}
              >
                <UserPlus2 className="h-4 w-4" />
                Sign Up
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <p className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs text-slate-600">
                JWT secured authentication
              </p>
              <p className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs text-slate-600">
                Role-based hospital account creation
              </p>
              <p className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs text-slate-600">
                Access prediction, history, and analytics
              </p>
            </div>
          </section>

          <section className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
            {mode === "signin" ? (
              <form className="space-y-4 animate-reveal-soft" onSubmit={handleSignIn}>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    name="role"
                    value={signInForm.role}
                    onChange={updateSignInField}
                    className={inputClass}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={signInForm.email}
                    onChange={updateSignInField}
                    placeholder="staff@hospital.ai"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    value={signInForm.password}
                    onChange={updateSignInField}
                    placeholder="Enter password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="interactive-lift inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form className="space-y-4 animate-reveal-soft" onSubmit={handleSignUp}>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={signUpForm.name}
                    onChange={updateSignUpField}
                    placeholder="Dr. Priya Sharma"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select
                    name="role"
                    value={signUpForm.role}
                    onChange={updateSignUpField}
                    className={inputClass}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={signUpForm.email}
                    onChange={updateSignUpField}
                    placeholder="new.staff@hospital.ai"
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      value={signUpForm.password}
                      onChange={updateSignUpField}
                      placeholder="Min 8 chars"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      value={signUpForm.confirmPassword}
                      onChange={updateSignUpField}
                      placeholder="Repeat password"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="interactive-lift inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
