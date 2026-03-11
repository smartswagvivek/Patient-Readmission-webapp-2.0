import { useMemo, useState } from "react";

const initialValues = {
  age: "",
  gender: "",
  time_in_hospital: "",
  num_medications: "",
  number_inpatient: "",
  primary_diagnosis: "",
};

function FieldIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-medical-primary" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export function PatientForm({ onSubmit, isLoading }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  const normalizedPayload = useMemo(
    () => ({
      age: Number(values.age),
      gender: values.gender,
      time_in_hospital: Number(values.time_in_hospital),
      num_medications: Number(values.num_medications),
      number_inpatient: Number(values.number_inpatient),
      primary_diagnosis: values.primary_diagnosis,
    }),
    [values]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const numberFields = [
      "age",
      "time_in_hospital",
      "num_medications",
      "number_inpatient",
    ];
    const hasInvalidNumber = numberFields.some(
      (field) => Number(values[field]) < 0 || Number.isNaN(Number(values[field]))
    );

    if (!values.gender || !values.primary_diagnosis) {
      return "Please select all required clinical options.";
    }
    if (hasInvalidNumber) {
      return "Numeric values must be valid and cannot be negative.";
    }
    if (Number(values.age) < 18 || Number(values.age) > 120) {
      return "Age should be between 18 and 120 years.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    await onSubmit(normalizedPayload);
  }

  const inputStyle =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fdfefe_100%)] px-4 py-3 text-base text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition focus:border-medical-primary focus:ring-4 focus:ring-medical-primary/15";

  return (
    <form onSubmit={handleSubmit} className="animate-reveal-soft space-y-6">
      <div className="stagger-reveal grid gap-5 md:grid-cols-2">
        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 5v5.59l3.7 3.7-1.4 1.41L11 13V7Z" />
            Age (years)
          </div>
          <input
            type="number"
            name="age"
            min="18"
            max="120"
            required
            value={values.age}
            onChange={updateField}
            className={inputStyle}
            placeholder="65"
          />
        </label>

        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M9 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM9 13c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4Zm6 1c-.46 0-.89.03-1.29.09A5.72 5.72 0 0 1 17 18v1h4v-1c0-2.21-2.69-4-6-4Z" />
            Gender
          </div>
          <select
            name="gender"
            required
            value={values.gender}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 15H5V10h14Zm0-11H5V6h14Z" />
            Time in Hospital (days)
          </div>
          <input
            type="number"
            name="time_in_hospital"
            min="0"
            required
            value={values.time_in_hospital}
            onChange={updateField}
            className={inputStyle}
            placeholder="4"
          />
        </label>

        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-5 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm1-7h-2V8h2Z" />
            Number of Medications
          </div>
          <input
            type="number"
            name="num_medications"
            min="0"
            required
            value={values.num_medications}
            onChange={updateField}
            className={inputStyle}
            placeholder="13"
          />
        </label>

        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5Zm0 9a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm4 7H8v-1a4 4 0 0 1 8 0Z" />
            Number of Inpatient Visits
          </div>
          <input
            type="number"
            name="number_inpatient"
            min="0"
            required
            value={values.number_inpatient}
            onChange={updateField}
            className={inputStyle}
            placeholder="2"
          />
        </label>

        <label className="interactive-lift premium-outline block rounded-2xl border border-blue-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f8ff_100%)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FieldIcon path="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-7 12-4-4h3V8h2v4h3Z" />
            Primary Diagnosis
          </div>
          <select
            name="primary_diagnosis"
            required
            value={values.primary_diagnosis}
            onChange={updateField}
            className={inputStyle}
          >
            <option value="">Select diagnosis</option>
            <option value="Cardiovascular Disorder">Cardiovascular Disorder</option>
            <option value="Respiratory Condition">Respiratory Condition</option>
            <option value="Type 2 Diabetes">Type 2 Diabetes</option>
            <option value="Renal Disorder">Renal Disorder</option>
            <option value="Post-Surgical Recovery">Post-Surgical Recovery</option>
            <option value="Infection">Infection</option>
            <option value="Neurological Disorder">Neurological Disorder</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="interactive-lift inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f80ed_0%,#1e67c5_100%)] px-6 py-4 text-base font-bold text-white shadow-soft transition hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Generating Risk Assessment
          </span>
        ) : (
          "Predict Readmission Risk"
        )}
      </button>
    </form>
  );
}
