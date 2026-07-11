import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const vehicles = await prisma.vehicle.findMany({
      where: { tenantId },
      include: { customer: true },
      orderBy: { model: "asc" },
    });

    return res.json(vehicles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { customerId, plate, brand, model, year, color, vin } = req.body;
    if (!customerId || !plate || !brand || !model || !year) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify if customer belongs to the tenant
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) {
      return res.status(400).json({ error: "Customer not found in this tenant" });
    }

    // Verify if vehicle plate already exists
    const existingVehicle = await prisma.vehicle.findUnique({ where: { plate } });
    if (existingVehicle) {
      return res.status(400).json({ error: "Vehicle plate already registered" });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId,
        plate,
        brand,
        model,
        year: Number(year),
        color,
        vin,
        tenantId,
      },
    });

    return res.status(201).json(vehicle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { plate, brand, model, year, color, vin } = req.body;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        plate,
        brand,
        model,
        year: year ? Number(year) : undefined,
        color,
        vin,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    await prisma.vehicle.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
