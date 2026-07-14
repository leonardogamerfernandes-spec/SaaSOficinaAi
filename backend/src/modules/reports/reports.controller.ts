import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function getFinancialReports(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    // Completed service orders for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const completedOrders = await prisma.serviceOrder.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        completedAt: {
          gte: startOfYear,
        },
      },
      select: {
        totalPrice: true,
        completedAt: true,
      },
    });

    // Group by month
    const monthlyRevenue: Record<number, number> = {};
    for (let i = 0; i < 12; i++) {
      monthlyRevenue[i] = 0;
    }

    let totalRevenue = 0;
    completedOrders.forEach(order => {
      if (order.completedAt) {
        const month = new Date(order.completedAt).getMonth();
        monthlyRevenue[month] += order.totalPrice;
        totalRevenue += order.totalPrice;
      }
    });

    const monthlyData = Object.keys(monthlyRevenue).map(key => {
      const monthNum = Number(key);
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return {
        month: monthNames[monthNum],
        revenue: monthlyRevenue[monthNum],
      };
    });

    const totalCount = completedOrders.length;
    const ticketMedio = totalCount > 0 ? totalRevenue / totalCount : 0;

    return res.json({
      totalRevenue,
      ticketMedio,
      completedOrdersCount: totalCount,
      monthlyData,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getTopServices(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    // Fetch service items belonging to completed orders
    const serviceItems = await prisma.serviceItem.findMany({
      where: {
        serviceOrder: {
          tenantId,
          status: "COMPLETED",
        },
      },
      select: {
        description: true,
        totalPrice: true,
        type: true,
      },
    });

    // Aggregate by description
    const counts: Record<string, { count: number; totalValue: number; type: string }> = {};
    serviceItems.forEach(item => {
      const desc = item.description.trim();
      if (!counts[desc]) {
        counts[desc] = { count: 0, totalValue: 0, type: item.type };
      }
      counts[desc].count += 1;
      counts[desc].totalValue += item.totalPrice;
    });

    const topServices = Object.keys(counts)
      .map(desc => ({
        description: desc,
        count: counts[desc].count,
        totalValue: counts[desc].totalValue,
        type: counts[desc].type,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.json(topServices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getTopCustomers(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const completedOrders = await prisma.serviceOrder.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    const customerSpent: Record<string, { name: string; phone: string; spent: number; count: number }> = {};
    completedOrders.forEach(order => {
      const id = order.customerId;
      if (!customerSpent[id]) {
        customerSpent[id] = {
          name: order.customer.name,
          phone: order.customer.phone,
          spent: 0,
          count: 0,
        };
      }
      customerSpent[id].spent += order.totalPrice;
      customerSpent[id].count += 1;
    });

    const topCustomers = Object.keys(customerSpent)
      .map(id => ({
        id,
        name: customerSpent[id].name,
        phone: customerSpent[id].phone,
        spent: customerSpent[id].spent,
        ordersCount: customerSpent[id].count,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    return res.json(topCustomers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
