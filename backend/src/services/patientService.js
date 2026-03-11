import { validationResult } from "express-validator";
import { createPatient } from "../models/patientModel.js";
import { createPrediction } from "../models/predictionModel.js";
import { getRiskScore, getSimilarCases } from "./mlService.js";
import { createEmbeddingForText, generateClinicalRecommendations } from "./openaiService.js";

function mapRiskLevel(score) {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

function buildPatientSummary(input) {
  return `
Patient demographics: age bucket ${input.age}, ${input.gender}, race: ${input.race}.
Admission type: ${input.admission_type_id}, source: ${input.admission_source_id}, discharge disposition: ${input.discharge_disposition_id}.
Hospitalization: time in hospital ${input.time_in_hospital} days, ${input.num_lab_procedures} lab procedures, ${input.num_procedures} procedures.
Medications: ${input.num_medications} meds; diabetesMed=${input.diabetesMed}; change=${input.change}.
Utilization: outpatient ${input.number_outpatient}, emergency ${input.number_emergency}, inpatient ${input.number_inpatient}.
Diagnoses: primary_diagnosis=${input.primary_diagnosis}; diag_1=${input.diag_1}, diag_2=${input.diag_2}, diag_3=${input.diag_3}.
  `.trim();
}

function ageToBucket(ageValue) {
  const age = Number(ageValue);
  if (Number.isNaN(age)) return "Unknown";
  const clamped = Math.max(0, Math.min(99, Math.floor(age)));
  const lower = Math.floor(clamped / 10) * 10;
  const upper = lower + 10;
  return `[${lower}-${upper})`;
}

function toNumberOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function diagnosisToNumeric(primaryDiagnosis) {
  const source = String(primaryDiagnosis || "").trim().toLowerCase();
  if (!source) return 0;

  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 997;
  }

  return hash + 1;
}

function normalizeInput(input) {
  const defaults = {
    race: "Unknown",
    admission_type_id: 1,
    discharge_disposition_id: 1,
    admission_source_id: 7,
    num_lab_procedures: 0,
    num_procedures: 0,
    number_outpatient: 0,
    number_emergency: 0,
    primary_diagnosis: "General medicine",
    diabetesMed: "No",
    diag_1: null,
    diag_2: 0,
    diag_3: 0,
    change: "No",
  };

  const merged = {
    ...defaults,
    ...input,
  };

  const primaryDiagnosis = String(
    merged.primary_diagnosis || merged.diag_1 || "General medicine"
  )
    .trim()
    .slice(0, 120);
  const fallbackDiagCode = diagnosisToNumeric(primaryDiagnosis);

  return {
    ...merged,
    primary_diagnosis: primaryDiagnosis,
    age: ageToBucket(input.age),
    time_in_hospital: toNumberOr(merged.time_in_hospital, 0),
    num_medications: toNumberOr(merged.num_medications, 0),
    number_inpatient: toNumberOr(merged.number_inpatient, 0),
    diabetesMed: merged.diabetesMed === "Yes" ? "Yes" : "No",
    admission_type_id: toNumberOr(merged.admission_type_id, 1),
    discharge_disposition_id: toNumberOr(merged.discharge_disposition_id, 1),
    admission_source_id: toNumberOr(merged.admission_source_id, 7),
    num_lab_procedures: toNumberOr(merged.num_lab_procedures, 0),
    num_procedures: toNumberOr(merged.num_procedures, 0),
    number_outpatient: toNumberOr(merged.number_outpatient, 0),
    number_emergency: toNumberOr(merged.number_emergency, 0),
    diag_1: toNumberOr(merged.diag_1, fallbackDiagCode),
    diag_2: toNumberOr(merged.diag_2, 0),
    diag_3: toNumberOr(merged.diag_3, 0),
  };
}

function isLlmTemporaryFailure(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("503") ||
    message.includes("service unavailable") ||
    message.includes("high demand") ||
    message.includes("temporarily unavailable") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("etimedout")
  );
}

function buildFallbackRecommendations({ patient, riskScore, riskLevel, reason }) {
  const roundedRisk = Math.round(Number(riskScore || 0) * 100);
  const riskSentence =
    riskLevel === "High"
      ? "elevated due to inpatient utilization, medication burden, and diagnosis profile"
      : riskLevel === "Medium"
        ? "moderate and requires structured post-discharge follow-up"
        : "lower, but still needs standard continuity-of-care safeguards";

  return {
    risk_explanation: `The patient has a ${riskLevel} readmission risk (${roundedRisk}%). Risk appears ${riskSentence}.`,
    preventive_care_plan:
      "Schedule early follow-up within 7 days; reinforce discharge instructions; confirm medication reconciliation; assess social support and warning signs.",
    follow_up_recommendation:
      "Primary care review in 3-7 days, nurse check-in call within 48 hours, and escalation if symptoms worsen.",
    medication_review:
      `Review current medications (${patient.num_medications}) for adherence, interactions, and high-risk agents. Confirm patient understanding before discharge.`,
    fallback_note: `AI recommendation service was temporarily unavailable (${reason}). A safe default clinical plan was generated.`,
  };
}

export async function handlePredictionRequest(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors.array();
    throw error;
  }

  const input = req.body;
  const normalizedInput = normalizeInput(input);

  const patientRecord = await createPatient({
    age: String(input.age),
    gender: normalizedInput.gender,
    race: normalizedInput.race,
    time_in_hospital: normalizedInput.time_in_hospital,
    num_medications: normalizedInput.num_medications,
    number_inpatient: normalizedInput.number_inpatient,
  });

  const features = normalizedInput;
  const riskScore = await getRiskScore(features);
  const riskLevel = mapRiskLevel(riskScore);

  let similarCases = [];
  try {
    const summaryText = buildPatientSummary(normalizedInput);
    const embedding = await createEmbeddingForText(summaryText);
    similarCases = await getSimilarCases(embedding, 5);
  } catch (error) {
    if (!isLlmTemporaryFailure(error)) {
      throw error;
    }
    similarCases = [];
  }

  let recs;
  try {
    recs = await generateClinicalRecommendations({
      patient: normalizedInput,
      riskScore,
      riskLevel,
      similarCases,
    });
  } catch (error) {
    if (!isLlmTemporaryFailure(error)) {
      throw error;
    }

    recs = buildFallbackRecommendations({
      patient: normalizedInput,
      riskScore,
      riskLevel,
      reason: error?.message || "temporary upstream overload",
    });
  }

  const predictionRecord = await createPrediction({
    patient_id: patientRecord.id,
    risk_score: riskScore,
    risk_level: riskLevel,
    recommendation: JSON.stringify({
      recommendations: recs,
      patient_input: {
        age: input.age,
        gender: normalizedInput.gender,
        time_in_hospital: normalizedInput.time_in_hospital,
        num_medications: normalizedInput.num_medications,
        number_inpatient: normalizedInput.number_inpatient,
        primary_diagnosis: normalizedInput.primary_diagnosis,
      },
    }),
  });

  return {
    patient_id: patientRecord.id,
    prediction_id: predictionRecord.id,
    risk_score: riskScore,
    risk_level: riskLevel,
    primary_diagnosis: normalizedInput.primary_diagnosis,
    recommendations: recs,
    similar_cases: similarCases,
  };
}

