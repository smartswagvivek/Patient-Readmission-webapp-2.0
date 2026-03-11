import { useEffect, useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal, X } from "lucide-react";
import { fetchPredictionDetail, fetchPredictionHistory } from "../api/client.js";

function riskBadge(level) {
  if (level === "High") return "bg-red-50 text-red-700 border-red-200";
  if (level === "Medium") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function displayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

function recText(recommendations) {
  if (!recommendations) return "No recommendation available.";
  if (typeof recommendations.risk_explanation === "string") {
    return recommendations.risk_explanation;
  }
  const values = Object.values(recommendations).filter(Boolean);
  return values.join(" ");
}

function escapeCsvValue(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function History() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        setIsLoading(true);
        const items = await fetchPredictionHistory(300);
        if (isMounted) {
          setHistory(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.error?.message ||
              "Failed to load patient prediction history."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  async function openDetail(item) {
    setSelected(item);
    setDetail(null);
    setIsDetailLoading(true);
    try {
      const record = await fetchPredictionDetail(item.prediction_id);
      setDetail(record);
    } catch {
      setDetail(item);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
  }

  function resetFilters() {
    setSearchText("");
    setRiskFilter("All");
    setSortOrder("newest");
  }

  const filteredHistory = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = history.filter((item) => {
      const matchRisk = riskFilter === "All" || item.risk_level === riskFilter;
      if (!matchRisk) return false;

      if (!query) return true;

      const fields = [
        String(item.patient_id),
        String(item.age),
        String(item.primary_diagnosis || ""),
        String(item.risk_level || ""),
      ]
        .join(" ")
        .toLowerCase();

      return fields.includes(query);
    });

    filtered.sort((a, b) => {
      const first = new Date(a.prediction_date).getTime();
      const second = new Date(b.prediction_date).getTime();
      if (Number.isNaN(first) || Number.isNaN(second)) return 0;
      return sortOrder === "newest" ? second - first : first - second;
    });

    return filtered;
  }, [history, riskFilter, searchText, sortOrder]);

  const riskCounts = useMemo(
    () => ({
      high: history.filter((item) => item.risk_level === "High").length,
      medium: history.filter((item) => item.risk_level === "Medium").length,
      low: history.filter((item) => item.risk_level === "Low").length,
    }),
    [history]
  );

  function handleExportCsv() {
    if (!filteredHistory.length) return;

    const headers = [
      "prediction_id",
      "patient_id",
      "age",
      "gender",
      "primary_diagnosis",
      "risk_score",
      "risk_level",
      "time_in_hospital",
      "num_medications",
      "number_inpatient",
      "prediction_date",
    ];

    const lines = [headers.join(",")];
    filteredHistory.forEach((item) => {
      const row = [
        item.prediction_id,
        item.patient_id,
        item.age,
        item.gender || "",
        item.primary_diagnosis || "",
        item.risk_score,
        item.risk_level,
        item.time_in_hospital,
        item.num_medications,
        item.number_inpatient,
        item.prediction_date,
      ];
      lines.push(row.map(escapeCsvValue).join(","));
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `patient-history-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stagger-reveal space-y-4">
      <section className="interactive-lift premium-surface rounded-3xl p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Patient History</h1>
            <p className="mt-2 text-sm text-slate-600">
              Search and review previous predictions using patient IDs for privacy.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700">
                High: {riskCounts.high}
              </span>
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orange-700">
                Medium: {riskCounts.medium}
              </span>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Low: {riskCounts.low}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#f4faff_0%,#e9f5ff_100%)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              {filteredHistory.length} records
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!filteredHistory.length || isLoading}
              className="interactive-lift inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-medical-primary hover:text-medical-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by patient ID, diagnosis, age, or risk"
              className="w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fdfefe_100%)] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-medical-primary focus:ring-4 focus:ring-medical-primary/15"
            />
          </label>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-2.5 text-sm text-slate-600">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none"
            >
              <option value="All">All Risks</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-2.5 text-sm text-slate-600">
            Order
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              </select>
            </label>

          <button
            type="button"
            onClick={resetFilters}
            className="interactive-lift inline-flex items-center justify-center rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-medical-primary hover:text-medical-primary"
          >
            Clear Filters
          </button>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-wave h-10 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <p className="mt-5 text-sm text-slate-600">
            No matching prediction records found.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="py-2.5 pl-3 pr-2">Patient ID</th>
                  <th className="px-2 py-2.5">Age</th>
                  <th className="px-2 py-2.5">Diagnosis</th>
                  <th className="px-2 py-2.5">Risk Level</th>
                  <th className="px-2 py-2.5">Prediction Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.prediction_id}
                    onClick={() => openDetail(item)}
                    className="table-row-float cursor-pointer border-b border-slate-100 transition hover:bg-[#f6fbff]"
                  >
                    <td className="py-3 pl-3 pr-2 font-semibold text-slate-700">{item.patient_id}</td>
                    <td className="px-2 py-3 text-slate-600">{item.age}</td>
                    <td className="max-w-[240px] truncate px-2 py-3 text-slate-600">
                      {item.primary_diagnosis}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskBadge(
                          item.risk_level
                        )}`}
                      >
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-600">{displayDate(item.prediction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected ? (
        <section className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Prediction Details for Patient {selected.patient_id}
              </h2>
              <p className="mt-1 text-sm text-slate-600">Record ID: {selected.prediction_id}</p>
            </div>
            <button
              type="button"
              onClick={closeDetail}
              className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-2 text-slate-600 transition hover:border-medical-primary hover:text-medical-primary"
              aria-label="Close detail panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isDetailLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="skeleton-wave h-24 rounded-2xl" />
              ))}
            </div>
          ) : detail ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-blue-100 bg-[linear-gradient(160deg,#ffffff_0%,#f5faff_100%)] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Risk Summary</p>
                <p className="mt-2 text-sm text-slate-700">
                  Risk level: <span className="font-semibold">{detail.risk_level}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Probability:{" "}
                  <span className="font-semibold">
                    {Math.round(Number(detail.risk_score || 0) * 100)}%
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Diagnosis:{" "}
                  <span className="font-semibold">{detail.primary_diagnosis || "Unknown"}</span>
                </p>
              </article>

              <article className="rounded-2xl border border-blue-100 bg-[linear-gradient(160deg,#ffffff_0%,#f5faff_100%)] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                  Recommendation Snapshot
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {recText(detail.recommendations)}
                </p>
              </article>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Details unavailable for this record.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
