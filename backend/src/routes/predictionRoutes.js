import express from "express";
import {
  predictionDetailController,
  predictionHistoryController,
} from "../controllers/historyController.js";

export const router = express.Router();

router.get("/history", predictionHistoryController);
router.get("/:predictionId", predictionDetailController);

