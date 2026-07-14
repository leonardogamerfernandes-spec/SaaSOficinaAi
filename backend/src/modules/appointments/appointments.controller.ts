import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { scheduledTime: "asc" },
    });

    return res.json(appointments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { customerId, vehicleId, scheduledTime, notes } = req.body;

    if (!customerId || !vehicleId || !scheduledTime) {
      return res.status(400).json({ error: "Customer, vehicle, and scheduled time are required" });
    }

    // Verify relations belong to tenant
    const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } });
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, tenantId } });

    if (!customer) {
      return res.status(400).json({ error: "Customer not found in this tenant" });
    }
    if (!vehicle) {
      return res.status(400).json({ error: "Vehicle not found in this tenant" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        customerId,
        vehicleId,
        scheduledTime: new Date(scheduledTime),
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    return res.status(201).json(appointment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { scheduledTime, notes, status } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const data: any = {};
    if (scheduledTime) data.scheduledTime = new Date(scheduledTime);
    if (notes !== undefined) data.notes = notes;
    if (status) data.status = status;

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await prisma.appointment.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
