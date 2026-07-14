import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { requirePlan } from "../../shared/planGate";
import {
  listSessions,
  createSession,
  getSession,
  sendMessage,
  findParts,
} from "./ai.controller";

const router = Router();

router.use(authMiddleware);

router.get("/sessions", listSessions);
router.post("/sessions", createSession);
router.get("/sessions/:sessionId", getSession);
router.post("/sessions/:sessionId/message", sendMessage);

// Pro feature
router.post("/parts-finder", requirePlan("PRO"), findParts);

export default router;
