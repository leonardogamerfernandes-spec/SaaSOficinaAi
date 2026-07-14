import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { requirePlan } from "../../shared/planGate";
import { listWarranties, getWarranty, upsertWarranty } from "./warranties.controller";

const router = Router();

router.use(authMiddleware);
router.use(requirePlan("PRO")); // Pro gated

router.get("/", listWarranties);
router.get("/order/:id", getWarranty);
router.post("/order/:id", upsertWarranty);

export default router;
