import { getPredictionDetail, getPredictionHistory } from "../services/historyService.js";

export async function predictionHistoryController(req, res, next) {
  try {
    const data = await getPredictionHistory(req.query.limit);
    res.json({ items: data });
  } catch (error) {
    next(error);
  }
}

export async function predictionDetailController(req, res, next) {
  try {
    const data = await getPredictionDetail(req.params.predictionId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

