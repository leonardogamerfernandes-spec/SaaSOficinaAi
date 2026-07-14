import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function getInspection(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id: serviceOrderId } = req.params;

    // Verify service order belongs to tenant
    const order = await prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, tenantId },
    });

    if (!order) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada" });
    }

    const checklist = await prisma.inspectionChecklist.findUnique({
      where: { serviceOrderId },
    });

    return res.json(checklist || null);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function upsertInspection(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id: serviceOrderId } = req.params;
    const data = req.body;

    // Verify service order belongs to tenant
    const order = await prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, tenantId },
    });

    if (!order) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada" });
    }

    const checklist = await prisma.inspectionChecklist.upsert({
      where: { serviceOrderId },
      create: {
        serviceOrderId,
        headlightsOk: !!data.headlightsOk,
        taillightsOk: !!data.taillightsOk,
        tiresOk: !!data.tiresOk,
        brakesOk: !!data.brakesOk,
        fluidsOk: !!data.fluidsOk,
        batteryOk: !!data.batteryOk,
        suspensionOk: !!data.suspensionOk,
        exhaustOk: !!data.exhaustOk,
        acOk: !!data.acOk,
        wiperOk: !!data.wiperOk,
        mirrorsOk: !!data.mirrorsOk,
        bodyDamageNotes: data.bodyDamageNotes || null,
        mileage: data.mileage ? Number(data.mileage) : null,
        fuelLevel: data.fuelLevel || null,
        notes: data.notes || null,
      },
      update: {
        headlightsOk: data.headlightsOk !== undefined ? !!data.headlightsOk : undefined,
        taillightsOk: data.taillightsOk !== undefined ? !!data.taillightsOk : undefined,
        tiresOk: data.tiresOk !== undefined ? !!data.tiresOk : undefined,
        brakesOk: data.brakesOk !== undefined ? !!data.brakesOk : undefined,
        fluidsOk: data.fluidsOk !== undefined ? !!data.fluidsOk : undefined,
        batteryOk: data.batteryOk !== undefined ? !!data.batteryOk : undefined,
        suspensionOk: data.suspensionOk !== undefined ? !!data.suspensionOk : undefined,
        exhaustOk: data.exhaustOk !== undefined ? !!data.exhaustOk : undefined,
        acOk: data.acOk !== undefined ? !!data.acOk : undefined,
        wiperOk: data.wiperOk !== undefined ? !!data.wiperOk : undefined,
        mirrorsOk: data.mirrorsOk !== undefined ? !!data.mirrorsOk : undefined,
        bodyDamageNotes: data.bodyDamageNotes !== undefined ? data.bodyDamageNotes : undefined,
        mileage: data.mileage !== undefined ? (data.mileage ? Number(data.mileage) : null) : undefined,
        fuelLevel: data.fuelLevel !== undefined ? data.fuelLevel : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
      },
    });

    // If mileage is provided, update it on the vehicle too for consistency
    if (data.mileage && order.vehicleId) {
      await prisma.vehicle.update({
        where: { id: order.vehicleId },
        data: { mileage: Number(data.mileage) },
      });
    }

    return res.json(checklist);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
