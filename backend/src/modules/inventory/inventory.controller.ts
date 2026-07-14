import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listInventory(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const items = await prisma.inventoryItem.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createInventoryItem(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { name, partNumber, brand, quantity, minQuantity, unitCost, unitPrice, category, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome do item é obrigatório" });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        tenantId,
        name,
        partNumber: partNumber || null,
        brand: brand || null,
        quantity: quantity !== undefined ? Number(quantity) : 0,
        minQuantity: minQuantity !== undefined ? Number(minQuantity) : 5,
        unitCost: unitCost !== undefined ? Number(unitCost) : 0.0,
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : 0.0,
        category: category || "OTHER",
        location: location || null,
      },
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateInventoryItem(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { name, partNumber, brand, quantity, minQuantity, unitCost, unitPrice, category, location } = req.body;

    const existing = await prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Item de estoque não encontrado" });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        partNumber: partNumber !== undefined ? partNumber : undefined,
        brand: brand !== undefined ? brand : undefined,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        minQuantity: minQuantity !== undefined ? Number(minQuantity) : undefined,
        unitCost: unitCost !== undefined ? Number(unitCost) : undefined,
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
        category: category !== undefined ? category : undefined,
        location: location !== undefined ? location : undefined,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteInventoryItem(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const existing = await prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Item de estoque não encontrado" });
    }

    await prisma.inventoryItem.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
