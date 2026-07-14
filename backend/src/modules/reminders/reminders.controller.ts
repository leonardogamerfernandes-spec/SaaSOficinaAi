import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listReminders(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const reminders = await prisma.serviceReminder.findMany({
      where: { tenantId },
      include: {
        customer: {
          select: { name: true, phone: true, email: true },
        },
        vehicle: {
          select: { brand: true, model: true, plate: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return res.json(reminders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createReminder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { customerId, vehicleId, type, description, dueDateKm, dueDate } = req.body;

    if (!customerId || !vehicleId || !type || !description) {
      return res.status(400).json({ error: "Faltam campos obrigatórios para o lembrete." });
    }

    // Verify relation belongs to tenant
    const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } });
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, tenantId } });

    if (!customer || !vehicle) {
      return res.status(400).json({ error: "Cliente ou veículo inválido para este tenant." });
    }

    const reminder = await prisma.serviceReminder.create({
      data: {
        tenantId,
        customerId,
        vehicleId,
        type,
        description,
        dueDateKm: dueDateKm ? Number(dueDateKm) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
      },
    });

    return res.status(201).json(reminder);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateReminder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { status, description, dueDateKm, dueDate } = req.body;

    const existing = await prisma.serviceReminder.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Lembrete não encontrado" });
    }

    const updated = await prisma.serviceReminder.update({
      where: { id },
      data: {
        status,
        description,
        dueDateKm: dueDateKm !== undefined ? (dueDateKm ? Number(dueDateKm) : null) : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteReminder(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const existing = await prisma.serviceReminder.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Lembrete não encontrado" });
    }

    await prisma.serviceReminder.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
