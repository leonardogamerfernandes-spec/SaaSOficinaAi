import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { getMetrics } from "./dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/metrics", getMetrics);

export default router;
