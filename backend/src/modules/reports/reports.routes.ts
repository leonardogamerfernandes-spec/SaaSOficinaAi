import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { requirePlan } from "../../shared/planGate";
import { getFinancialReports, getTopServices, getTopCustomers } from "./reports.controller";

const router = Router();

router.use(authMiddleware);
router.use(requirePlan("PRO")); // Gated for Pro plan and above

router.get("/financial", getFinancialReports);
router.get("/top-services", getTopServices);
router.get("/top-customers", getTopCustomers);

export default router;
