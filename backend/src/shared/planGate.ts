import { Response, NextFunction } from "express";
import { prisma } from "./prisma";
import { AuthenticatedRequest } from "./auth";

export type PlanType = "FREE" | "PRO" | "ENTERPRISE";

const PLAN_LEVELS: Record<PlanType, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

export function requirePlan(minimumPlan: PlanType) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant context missing" });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const currentPlan = (tenant.plan as PlanType) || "FREE";
      
      if (PLAN_LEVELS[currentPlan] < PLAN_LEVELS[minimumPlan]) {
        return res.status(403).json({
          error: `Este recurso está disponível apenas nos planos ${minimumPlan} ou superior.`,
          requiredPlan: minimumPlan,
          currentPlan: currentPlan,
        });
      }

      return next();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
