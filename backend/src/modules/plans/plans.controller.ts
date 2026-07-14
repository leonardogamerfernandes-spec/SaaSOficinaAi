import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function getPlanStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, plan: true, maxUsers: true },
    });

    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // Calculate usage statistics
    const customerCount = await prisma.customer.count({ where: { tenantId } });

    // Current month's start date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyServiceOrdersCount = await prisma.serviceOrder.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const userCount = await prisma.user.count({ where: { tenantId } });

    // Enforce thresholds
    const limits = {
      customers: tenant.plan === "FREE" ? 50 : Infinity,
      monthlyOrders: tenant.plan === "FREE" ? 30 : Infinity,
      users: tenant.plan === "FREE" ? 1 : tenant.plan === "PRO" ? 3 : Infinity,
    };

    return res.json({
      plan: tenant.plan,
      limits,
      usage: {
        customers: customerCount,
        monthlyOrders: monthlyServiceOrdersCount,
        users: userCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updatePlan(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { plan } = req.body;
    if (!plan || !["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ error: "Plano inválido ou ausente." });
    }

    let maxUsers = 1;
    if (plan === "PRO") maxUsers = 3;
    if (plan === "ENTERPRISE") maxUsers = 999;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan,
        maxUsers,
      },
    });

    return res.json({
      message: `Plano atualizado com sucesso para ${plan}`,
      plan: updated.plan,
      maxUsers: updated.maxUsers,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
