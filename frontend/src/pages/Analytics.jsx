import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchPredictionHistory } from "../api/client.js";

const pieColors = ["#16A34A", "#F97316", "#DC2626"];

function monthKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return { label: "Unknown", order: "9999-99" };
  const month = date.getMonth() + 1;
  return {
    label: date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    order: `${date.getFullYear()}-${String(month).padStart(2, "0")}`,
  };
}

function ageGroup(age) {
  const n = Number(age);
  if (n >= 20 && n < 30) return "20-30";
  if (n >= 30 && n < 40) return "30-40";
  if (n >= 40 && n < 50) return "40-50";
  if (n >= 50 && n < 60) return "50-60";
  return "60+";
}

function summarizeRiskByGroup(items, keyResolver) {
  const map = new Map();

  items.forEach((item) => {
    const key = keyResolver(item);
    const current = map.get(key) || { sum: 0, count: 0 };
    current.sum += Number(item.risk_score || 0);
    current.count += 1;
    map.set(key, current);
  });

  return Array.from(map.entries()).map(([key, value]) => ({
    name: key,
    value: Number(((value.sum / value.count) * 100).toFixed(1)),
  }));
}

function ChartCard({ title, children }) {
  return (
    <article className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 h-[290px]">{children}</div>
    </article>
  );
}

export function Analytics() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const records = await fetchPredictionHistory(500);
        if (isMounted) {
          setHistory(records);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.error?.message ||
              "Unable to load analytics data from prediction history."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const riskDistribution = useMemo(() => {
    const low = history.filter((item) => item.risk_level === "Low").length;
    const medium = history.filter((item) => item.risk_level === "Medium").length;
    const high = history.filter((item) => item.risk_level === "High").length;
    return [
      { name: "Low Risk Patients", value: low },
      { name: "Medium Risk Patients", value: medium },
      { name: "High Risk Patients", value: high },
    ];
  }, [history]);

  const riskByAge = useMemo(() => {
    const ordered = ["20-30", "30-40", "40-50", "50-60", "60+"];
    const grouped = summarizeRiskByGroup(history, (item) => ageGroup(item.age));
    return ordered.map(
      (label) => grouped.find((item) => item.name === label) || { name: label, value: 0 }
    );
  }, [history]);

  const stayVsRisk = useMemo(() => {
    const grouped = summarizeRiskByGroup(history, (item) => String(item.time_in_hospital));
    return grouped
      .map((item) => ({ ...item, day: Number(item.name) }))
      .filter((item) => Number.isFinite(item.day))
      .sort((a, b) => a.day - b.day)
      .slice(0, 25)
      .map((item) => ({ stay: item.day, risk: item.value }));
  }, [history]);

  const monthlyTrend = useMemo(() => {
    const map = new Map();
    history.forEach((item) => {
      const month = monthKey(item.prediction_date);
      const current = map.get(month.order) || { label: month.label, count: 0 };
      if (Number(item.risk_score || 0) >= 0.5) {
        current.count += 1;
      }
      map.set(month.order, current);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => ({
        month: value.label,
        readmissions: value.count,
      }));
  }, [history]);

  const avgRisk = useMemo(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, item) => acc + Number(item.risk_score || 0), 0);
    return Math.round((sum / history.length) * 100);
  }, [history]);

  const topAgeGroup = useMemo(() => {
    const sorted = [...riskByAge].sort((a, b) => b.value - a.value);
    return sorted[0]?.name || "N/A";
  }, [riskByAge]);

  const peakMonth = useMemo(() => {
    const sorted = [...monthlyTrend].sort((a, b) => b.readmissions - a.readmissions);
    return sorted[0]?.month || "N/A";
  }, [monthlyTrend]);

  if (isLoading) {
    return (
      <section className="premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
        <div className="space-y-3">
          <div className="skeleton-wave h-5 w-44 rounded" />
          <div className="skeleton-wave h-4 w-72 rounded" />
          <div className="skeleton-wave mt-4 h-60 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-soft">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </section>
    );
  }

  return (
    <div className="stagger-reveal space-y-5">
      <section className="interactive-lift shimmer-line premium-surface rounded-3xl p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Hospital Analytics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Readmission intelligence derived from historical prediction records.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                Riskiest Age Group: {topAgeGroup}
              </span>
              <span className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                Peak Month: {peakMonth}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs font-semibold text-slate-700">
              <Activity className="h-3.5 w-3.5 text-medical-primary" />
              Total Records: {history.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs font-semibold text-slate-700">
              <TrendingUp className="h-3.5 w-3.5 text-medical-primary" />
              Average Risk: {avgRisk}%
            </span>
            <Link
              to="/app/history"
              className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-medical-primary hover:text-medical-primary"
            >
              Open History
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk by Age Group">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskByAge}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#1E88E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Hospital Stay vs Risk">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stayVsRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
              <XAxis dataKey="stay" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Readmission Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="readmissions"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}
