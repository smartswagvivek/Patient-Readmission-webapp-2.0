import { Link } from "react-router-dom";
import { Activity, BarChart3, ClipboardList } from "lucide-react";
import { RadialOrbitalTimelineDemo } from "../components/RadialOrbitalTimelineDemo.jsx";
import { Button as NeonButton } from "../components/ui/neon-button.jsx";
import { SpotlightCard } from "../components/ui/spotlight-card.jsx";

const featureCards = [
  {
    title: "AI Risk Prediction",
    description:
      "Rapid 30-day readmission assessment from structured discharge indicators.",
    icon: Activity,
  },
  {
    title: "Patient History Tracking",
    description:
      "Review previous risk assessments using patient IDs with filters and details.",
    icon: ClipboardList,
  },
  {
    title: "Hospital Analytics Dashboard",
    description:
      "Monitor risk distribution, age group trends, and monthly readmission patterns.",
    icon: BarChart3,
  },
];

const workflow = [
  "Enter discharge data",
  "AI predicts risk",
  "Preventive care generated",
];

const benefits = [
  "Reduce readmissions",
  "Improve patient outcomes",
  "Assist clinicians",
  "Evidence-based care",
];

export function Landing() {
  return (
    <div className="stagger-reveal space-y-12">
      <section className="interactive-lift premium-surface grid gap-8 rounded-[2rem] p-8 shadow-soft lg:grid-cols-2 lg:items-center lg:p-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
            MedInsight AI
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Smart Clinical Decision Support for Patient Readmission Risk
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Clinical decision support system predicting 30-day hospital
            readmission risk.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              30-day Readmission Signal
            </span>
            <span className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              Synthetic Demo Data
            </span>
            <span className="rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              Clinical Support Only
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <NeonButton variant="solid" size="lg" className="interactive-lift font-bold">
                Get Started
              </NeonButton>
            </Link>
          </div>
        </div>
        <div className="relative w-full">
          <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-full bg-medical-primary/15 blur-2xl lg:block" />
          <div className="absolute -bottom-6 -right-6 hidden h-28 w-28 rounded-full bg-cyan-200/40 blur-2xl lg:block" />
          <div className="orbital-float">
            <RadialOrbitalTimelineDemo />
          </div>
        </div>
      </section>

      <section id="learn-more" className="grid gap-5 md:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <SpotlightCard
              key={card.title}
              className="animate-reveal-soft float-soft interactive-lift"
            >
              <div className="mb-4 inline-flex rounded-2xl border border-blue-100 bg-white/90 p-2.5 text-medical-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {card.description}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-medical-primary/80">
                Interactive Module
              </p>
            </SpotlightCard>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="interactive-lift premium-outline rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff,#f4fbff)] p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-800">Clinical Workflow</h2>
          <ol className="mt-5 space-y-4">
            {workflow.map((step, index) => (
              <li key={step} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#e8f4ff_100%)] text-sm font-bold text-medical-primary">
                  {index + 1}
                </div>
                <p className="pt-1 text-base font-medium text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="interactive-lift premium-outline rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff,#f4fbff)] p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-800">Clinical Benefits</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {benefits.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#f6fbff_0%,#edf6ff_100%)] px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="interactive-lift premium-outline rounded-3xl border border-cyan-200 bg-[linear-gradient(135deg,#e9f6ff,#dff8ff)] p-8 text-center shadow-soft">
        <h2 className="text-3xl font-bold text-slate-800">
          Ready for Patient Discharge Risk Assessment
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
          Login to access patient prediction, recommendations, and hospital
          analytics.
        </p>
        <Link
          to="/login"
          className="mt-7 inline-flex"
        >
          <NeonButton size="lg" className="interactive-lift font-bold">
            Get Started
          </NeonButton>
        </Link>
      </section>
    </div>
  );
}
