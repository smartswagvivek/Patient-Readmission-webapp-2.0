import "dotenv/config";

import express from "express";
import cors from "cors";
import pino from "pino";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { router as predictRouter } from "./routes/predictRoutes.js";
import { router as authRouter } from "./routes/authRoutes.js";
import { router as predictionRouter } from "./routes/predictionRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { testDatabaseConnection } from "./models/db.js";
import { ensureUsersTable, seedDemoUsersIfMissing } from "./models/userModel.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: false }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api/auth", authRouter);
app.use("/api", authRouter);
app.use("/api/predict", authenticateToken, predictRouter);
app.use("/api/predictions", authenticateToken, predictionRouter);

app.use(notFoundHandler);
app.use(errorHandler(logger));

const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await testDatabaseConnection();
    await ensureUsersTable();
    await seedDemoUsersIfMissing();
    console.log("Database connected successfully");
    logger.info("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed");
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }

  app.listen(port, () => {
    logger.info(`Backend API listening on port ${port}`);
  });
}

startServer();

