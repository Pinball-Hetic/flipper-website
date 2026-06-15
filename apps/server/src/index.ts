import express from "express";
import cors from "cors";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./infrastructure/swagger";
import { ScoreController } from "./interface/ScoreController";
import { PendingScoreController } from "./interface/PendingScoreController";
import { ClaimController } from "./interface/ClaimController";
import { CheckpointController } from "./interface/CheckpointController";
import { UserController } from "./interface/UserController";
import { PseudoController } from "./interface/PseudoController";
import { AdminController } from "./interface/AdminController";
import { MachineController } from "./interface/MachineController";
import { V1ScoreController } from "./interface/V1ScoreController";
import { V1ClaimController } from "./interface/V1ClaimController";
import { V1LeaderboardController } from "./interface/V1LeaderboardController";
import { startCron } from "./interface/CronJob";

config({ path: "../../.env" });

if (!process.env.BORNE_API_KEY) {
  if (process.env.NODE_ENV === "production") {
    console.error("[FATAL] BORNE_API_KEY non définie en production. Arrêt.");
    process.exit(1);
  } else {
    console.warn("[WARN] BORNE_API_KEY non définie — auth désactivée en dev");
  }
}

const app = express();
const port = 8882;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8888", "http://localhost:8881", "http://localhost:8882"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "server", port });
});

app.get("/api/checkpoints/:id/scores", CheckpointController.getScores);
app.get("/api/users/:id/stats", UserController.getStats);
app.post("/api/users/pseudo", PseudoController.set);
app.get("/api/users/pseudo/check", PseudoController.check);
app.get("/api/machines", MachineController.getAll);
app.get("/api/admin/ping", AdminController.ping);

app.post("/api/scores", ScoreController.handle);
app.post("/api/pending-scores", PendingScoreController.handle);
app.post("/api/pending-scores/claim", ClaimController.handle);
app.get("/api/pending-scores/:code", PendingScoreController.getByCode);

// v1 — surface parallèle découplée pour les bornes (auth Bearer CABINET_KEY)
app.post("/v1/scores", V1ScoreController.create);
app.get("/v1/claim/:code", V1ClaimController.get);
app.post("/v1/claim/:code", V1ClaimController.claim);
app.get("/v1/leaderboard", V1LeaderboardController.get);

startCron();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
