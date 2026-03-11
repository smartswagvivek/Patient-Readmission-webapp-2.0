import { query } from "./db.js";

export async function getPredictionHistoryRows(limit = 100) {
  const sql = `
    SELECT
      pr.id AS prediction_id,
      pr.patient_id,
      p.age,
      p.gender,
      p.time_in_hospital,
      p.num_medications,
      p.number_inpatient,
      pr.risk_score,
      pr.risk_level,
      pr.recommendation,
      pr.created_at
    FROM predictions pr
    INNER JOIN patients p ON p.id = pr.patient_id
    ORDER BY pr.created_at DESC
    LIMIT ?
  `;

  return query(sql, [limit]);
}

export async function getPredictionByIdRow(predictionId) {
  const sql = `
    SELECT
      pr.id AS prediction_id,
      pr.patient_id,
      p.age,
      p.gender,
      p.time_in_hospital,
      p.num_medications,
      p.number_inpatient,
      pr.risk_score,
      pr.risk_level,
      pr.recommendation,
      pr.created_at
    FROM predictions pr
    INNER JOIN patients p ON p.id = pr.patient_id
    WHERE pr.id = ?
    LIMIT 1
  `;

  const rows = await query(sql, [predictionId]);
  return rows?.[0] || null;
}

