import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import {
  listSessions,
  createSession,
  getSession,
  sendMessage,
} from "./ai.controller";

const router = Router();

router.use(authMiddleware);

router.get("/sessions", listSessions);
router.post("/sessions", createSession);
router.get("/sessions/:sessionId", getSession);
router.post("/sessions/:sessionId/message", sendMessage);

export default router;
