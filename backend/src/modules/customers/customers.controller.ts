import { Response } from "express";
import { prisma } from "../../shared/prisma";
import { AuthenticatedRequest } from "../../shared/auth";

export async function listCustomers(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: { vehicles: true },
      orderBy: { name: "asc" },
    });

    return res.json(customers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { name, email, phone, cpfCnpj, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        tenantId,
      },
    });

    return res.status(201).json(customer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;
    const { name, email, phone, cpfCnpj, address } = req.body;

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, cpfCnpj, address },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteCustomer(req: AuthenticatedRequest, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Tenant context missing" });

    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await prisma.customer.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
