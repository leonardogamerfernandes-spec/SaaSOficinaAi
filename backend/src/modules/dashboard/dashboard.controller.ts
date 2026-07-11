import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function getMetrics(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    // Count customers and vehicles
    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    const totalVehicles = await prisma.vehicle.count({ where: { tenantId } });

    // Service order stats
    const activeOrdersCount = await prisma.serviceOrder.count({
      where: { tenantId, status: "IN_PROGRESS" },
    });

    const pendingBudgetsCount = await prisma.serviceOrder.count({
      where: { tenantId, status: "DRAFT_BUDGET" },
    });

    const completedOrders = await prisma.serviceOrder.findMany({
      where: {
        tenantId,
        status: { in: ["COMPLETED", "BUDGET_APPROVED", "IN_PROGRESS"] },
      },
      select: { totalPrice: true },
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Recent orders
    const recentOrders = await prisma.serviceOrder.findMany({
      where: { tenantId },
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Mock weekly performance chart data
    const weeklyRevenue = [
      { day: "Seg", revenue: totalRevenue * 0.15 },
      { day: "Ter", revenue: totalRevenue * 0.2 },
      { day: "Qua", revenue: totalRevenue * 0.18 },
      { day: "Qui", revenue: totalRevenue * 0.22 },
      { day: "Sex", revenue: totalRevenue * 0.25 },
      { day: "Sáb", revenue: totalRevenue * 0.1 },
    ];

    return res.json({
      metrics: {
        totalCustomers,
        totalVehicles,
        activeOrdersCount,
        pendingBudgetsCount,
        totalRevenue,
      },
      recentOrders,
      weeklyRevenue,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
