import { getPredictionByIdRow, getPredictionHistoryRows } from "../models/historyModel.js";

function parseRecommendationPayload(rawValue) {
  if (!rawValue) {
    return { recommendations: {}, patient_input: {} };
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object") {
      if (parsed.recommendations || parsed.patient_input) {
        return {
          recommendations:
            parsed.recommendations && typeof parsed.recommendations === "object"
              ? parsed.recommendations
              : {},
          patient_input:
            parsed.patient_input && typeof parsed.patient_input === "object"
              ? parsed.patient_input
              : {},
        };
      }
      return { recommendations: parsed, patient_input: {} };
    }
  } catch {
    return {
      recommendations: { risk_explanation: String(rawValue) },
      patient_input: {},
    };
  }

  return { recommendations: {}, patient_input: {} };
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toHistoryItem(row) {
  const payload = parseRecommendationPayload(row.recommendation);
  const diagnosis =
    payload.patient_input.primary_diagnosis ||
    payload.patient_input.diag_1 ||
    "Unknown";

  return {
    prediction_id: row.prediction_id,
    patient_id: row.patient_id,
    age: toNumber(row.age),
    gender: row.gender,
    time_in_hospital: toNumber(row.time_in_hospital),
    num_medications: toNumber(row.num_medications),
    number_inpatient: toNumber(row.number_inpatient),
    risk_score: toNumber(row.risk_score),
    risk_level: row.risk_level,
    primary_diagnosis: String(diagnosis),
    prediction_date: row.created_at,
    recommendations: payload.recommendations,
  };
}

export async function getPredictionHistory(limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const rows = await getPredictionHistoryRows(safeLimit);
  return rows.map(toHistoryItem);
}

export async function getPredictionDetail(predictionId) {
  const row = await getPredictionByIdRow(predictionId);
  if (!row) {
    const error = new Error("Prediction record not found");
    error.status = 404;
    throw error;
  }
  return toHistoryItem(row);
}

