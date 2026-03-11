import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ClipboardCheck, LoaderCircle, Sparkles } from "lucide-react";
import { predictReadmission } from "../api/client.js";
import { PatientForm } from "../components/PatientForm.jsx";

const loadingSteps = [
  "Analyzing patient data...",
  "Running machine learning prediction...",
  "Retrieving similar patient cases...",
  "Generating AI recommendations...",
];

function PredictionLoadingOverlay({ stepIndex }) {
  const progress = ((stepIndex + 1) / loadingSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
      <div className="loading-glass-panel w-full max-w-xl rounded-3xl p-6 shadow-card sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="loading-ring rounded-full">
              <LoaderCircle className="h-6 w-6 animate-spin text-medical-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Generating Risk Prediction
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-medical-primary">
                Clinical AI in progress
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-medical-primary" />
            {Math.round(progress)}%
          </span>
        </div>

        <div className="loading-progress-track mt-5 h-2.5 w-full rounded-full">
          <div
            className="loading-progress-bar h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 space-y-2" aria-live="polite">
          {loadingSteps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition ${
                index < stepIndex
                  ? "bg-emerald-50/80 text-emerald-700"
                  : index === stepIndex
                    ? "bg-blue-50 text-slate-800"
                    : "text-slate-500"
              }`}
            >
              {index < stepIndex ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : index === stepIndex ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-medical-primary" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
              <span className={index <= stepIndex ? "font-semibold" : ""}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Predict() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => clearInterval(timer);
  }, [isLoading]);

  async function handleSubmit(payload) {
    try {
      setIsLoading(true);
      setError("");
      const result = await predictReadmission(payload);
      navigate("/app/results", {
        state: {
          result,
          input: payload,
          completedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      const rawMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to complete prediction at this time.";
      const message = String(rawMessage).includes("503")
        ? "AI service is temporarily busy. Please retry in a few seconds."
        : rawMessage;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="stagger-reveal relative grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <section className="interactive-lift premium-surface rounded-[2rem] p-8 shadow-soft">
        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-medical-primary">
            Patient Entry Form
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Essential Discharge Inputs
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Enter only clinically essential fields to generate AI-supported
            readmission risk assessment.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef7ff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-600">
              <ClipboardCheck className="h-3.5 w-3.5 text-medical-primary" />
              6 Required Clinical Inputs
            </span>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
      </section>

      <aside className="stagger-reveal space-y-5">
        <article className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
          <h2 className="text-lg font-bold text-slate-800">Assessment Workflow</h2>
          <ol className="mt-4 space-y-4 text-sm text-slate-600">
            <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eaf5ff_100%)] font-bold text-medical-primary">
                1
              </span>
              Clinical entry data captured
            </li>
            <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eaf5ff_100%)] font-bold text-medical-primary">
                2
              </span>
              AI risk score generated
            </li>
            <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eaf5ff_100%)] font-bold text-medical-primary">
                3
              </span>
              Preventive care plan and follow-up generated
            </li>
          </ol>
        </article>

        <article className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
          <h2 className="text-lg font-bold text-slate-800">Clinical Guidance</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#f6fbff_0%,#edf7ff_100%)] px-3 py-2">
              Keep numeric values aligned with latest discharge summary.
            </li>
            <li className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#f6fbff_0%,#edf7ff_100%)] px-3 py-2">
              Use this output for decision support, not as the only source of care
              planning.
            </li>
            <li className="rounded-xl border border-blue-100 bg-[linear-gradient(180deg,#f6fbff_0%,#edf7ff_100%)] px-3 py-2">
              Review recommendations with multidisciplinary teams before discharge.
            </li>
          </ul>
        </article>

        <article className="interactive-lift premium-outline rounded-3xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f6fbff_100%)] p-6 shadow-soft">
          <h2 className="text-lg font-bold text-slate-800">Input Reference</h2>
          <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-2">
            <p className="rounded-xl border border-blue-100 bg-medical-ice px-3 py-2">
              Age: 18 to 120 years
            </p>
            <p className="rounded-xl border border-blue-100 bg-medical-ice px-3 py-2">
              Time in Hospital: 0+ days
            </p>
            <p className="rounded-xl border border-blue-100 bg-medical-ice px-3 py-2">
              Medications: non-negative integer
            </p>
            <p className="rounded-xl border border-blue-100 bg-medical-ice px-3 py-2">
              Inpatient Visits: non-negative integer
            </p>
          </div>
        </article>
      </aside>

      {isLoading ? <PredictionLoadingOverlay stepIndex={loadingStep} /> : null}
    </div>
  );
}
