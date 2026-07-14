import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { getPlanStatus, updatePlan } from "./plans.controller";

const router = Router();

router.use(authMiddleware);

router.get("/status", getPlanStatus);
router.post("/update", updatePlan);

export default router;
