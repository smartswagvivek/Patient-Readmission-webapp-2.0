import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircleCheckBig,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchPredictionHistory } from "../api/client.js";

function riskTone(level) {
  if (String(level).toLowerCase() === "high") return "text-red-600 bg-red-50 border-red-200";
  if (String(level).toLowerCase() === "medium") {
    return "text-orange-600 bg-orange-50 border-orange-200";
  }
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

function SummaryCard({ title, value, hint, tone, icon: Icon }) {
  return (
    <article className="interactive-lift group premium-outline rounded-2xl border border-blue-100 bg-[linear-gradient(160deg,#ffffff_0%,#f4f9ff_100%)] p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
          <p className={`mt-2 text-xs font-semibold ${tone}`}>{hint}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eaf5ff_100%)] p-2.5 text-medical-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function severityBars(summary) {
  const maxValue = Math.max(summary.high, summary.medium, summary.low, 1);
  return [
    { label: "High", value: summary.high, color: "bg-red-500", width: (summary.high / maxValue) * 100 },
    {
      label: "Medium",
      value: summary.medium,
      color: "bg-orange-500",
      width: (summary.medium / maxValue) * 100,
    },
    { label: "Low", value: summary.low, color: "bg-emerald-500", width: (summary.low / maxValue) * 100 },
  ];
}

export function Dashboard() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError("");
      const items = await fetchPredictionHistory(200);
      setHistory(items);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          "Unable to load dashboard summary right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const total = history.length;
    const high = history.filter((item) => item.risk_level === "High").length;
    const medium = history.filter((item) => item.risk_level === "Medium").length;
    const low = history.filter((item) => item.risk_level === "Low").length;
    const avgRisk =
      total > 0
        ? Math.round(
            (history.reduce((acc, curr) => acc + Number(curr.risk_score || 0), 0) / total) * 100
          )
        : 0;

    return { total, high, medium, low, avgRisk };
  }, [history]);

  const sortedHistory = useMemo(() => {
    const cloned = [...history];
    cloned.sort((a, b) => {
      const first = new Date(a.prediction_date).getTime();
      const second = new Date(b.prediction_date).getTime();
      if (Number.isNaN(first) || Number.isNaN(second)) return 0;
      return sortOrder === "newest" ? second - first : first - second;
    });
    return cloned;
  }, [history, sortOrder]);

  const recent = sortedHistory.slice(0, 6);
  const bars = severityBars(summary);
  const highRiskRate = summary.total > 0 ? Math.round((summary.high / summary.total) * 100) : 0;
  const lastUpdated = sortedHistory[0]?.prediction_date
    ? new Date(sortedHistory[0].prediction_date).toLocaleString()
    : "No records yet";

  return (
    <div className="stagger-reveal space-y-5">
      <section className="interactive-lift shimmer-line premium-surface rounded-2xl p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-medical-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Hospital Operations Snapshot
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Readmission Risk Command Center
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Live summary of patient risk predictions, severity mix, and recent cases.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-600">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                High Risk Rate: {highRiskRate}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-600">
                <CalendarClock className="h-3.5 w-3.5 text-medical-primary" />
                Last Updated: {lastUpdated}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/app/predict"
              className="interactive-lift inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.03]"
            >
              New Prediction
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Assessments"
          value={summary.total}
          hint="All recorded predictions"
          tone="text-slate-500"
          icon={Users}
        />
        <SummaryCard
          title="Average Risk"
          value={`${summary.avgRisk}%`}
          hint="Mean probability score"
          tone="text-medical-primary"
          icon={Timer}
        />
        <SummaryCard
          title="High Risk Patients"
          value={summary.high}
          hint="Needs urgent follow-up"
          tone="text-red-600"
          icon={AlertTriangle}
        />
        <SummaryCard
          title="Low Risk Patients"
          value={summary.low}
          hint="Stable discharge profile"
          tone="text-emerald-600"
          icon={CircleCheckBig}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <article className="interactive-lift premium-outline rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Predictions</h2>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs font-semibold text-slate-600">
                Order
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </label>
              <Link
                to="/app/history"
                className="inline-flex items-center gap-1 text-sm font-semibold text-medical-primary"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-wave h-11 rounded-xl"
                />
              ))}
            </div>
          ) : error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : recent.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No predictions found yet. Start with a new risk assessment.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Patient ID</th>
                    <th className="py-2 pr-3">Age</th>
                    <th className="py-2 pr-3">Diagnosis</th>
                    <th className="py-2 pr-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                  <tr
                    key={item.prediction_id}
                    className="table-row-float border-b border-slate-100"
                  >
                      <td className="py-3 pr-3 font-semibold text-slate-700">{item.patient_id}</td>
                      <td className="py-3 pr-3 text-slate-600">{item.age}</td>
                      <td className="max-w-[190px] truncate py-3 pr-3 text-slate-600">
                        {item.primary_diagnosis}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskTone(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="interactive-lift premium-outline rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Risk Mix</h2>
          <p className="mt-1 text-sm text-slate-600">
            Distribution of low, medium, and high risk predictions.
          </p>

          <div className="mt-5 space-y-4">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${bar.color}`}
                    style={{ width: `${bar.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to="/app/analytics"
              className="block rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#f4faff_0%,#e8f5ff_100%)] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-medical-primary"
            >
              Review hospital readmission trends
            </Link>
            <Link
              to="/app/history"
              className="block rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-medical-primary"
            >
              Open full patient prediction history
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
