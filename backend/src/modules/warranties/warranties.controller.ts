import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listWarranties(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const warranties = await prisma.serviceWarranty.findMany({
      where: {
        serviceOrder: {
          tenantId,
        },
      },
      include: {
        serviceOrder: {
          include: {
            customer: { select: { name: true, phone: true } },
            vehicle: { select: { brand: true, model: true, plate: true } },
          },
        },
      },
      orderBy: { expiresAt: "asc" },
    });

    return res.json(warranties);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getWarranty(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id: serviceOrderId } = req.params;

    const order = await prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, tenantId },
    });

    if (!order) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada" });
    }

    const warranty = await prisma.serviceWarranty.findUnique({
      where: { serviceOrderId },
    });

    return res.json(warranty || null);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function upsertWarranty(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id: serviceOrderId } = req.params;
    const { warrantyDays, notes } = req.body;

    const order = await prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, tenantId },
    });

    if (!order) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada" });
    }

    if (order.status !== "COMPLETED") {
      return res.status(400).json({ error: "Garantia só pode ser emitida para ordens de serviço concluídas." });
    }

    const days = warrantyDays ? Number(warrantyDays) : 90;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const warranty = await prisma.serviceWarranty.upsert({
      where: { serviceOrderId },
      create: {
        serviceOrderId,
        warrantyDays: days,
        expiresAt,
        notes: notes || null,
      },
      update: {
        warrantyDays: days,
        expiresAt,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return res.json(warranty);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
