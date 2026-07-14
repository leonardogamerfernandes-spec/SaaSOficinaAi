import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../../shared/prisma";
import { signToken } from "../../shared/auth";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, tenantName, cnpj, phone, address } = req.body;

    if (!name || !email || !password || !tenantName || !cnpj) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingTenant = await prisma.tenant.findUnique({ where: { cnpj } });
    if (existingTenant) {
      return res.status(400).json({ error: "CNPJ already registered" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName, cnpj, phone, address },
      });

      const user = await tx.user.create({
        data: { name, email, passwordHash, role: "ADMIN", tenantId: tenant.id },
      });

      return { tenant, user };
    });

    const token = signToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      tenantId: result.tenant.id,
    });

    return res.status(201).json({
      token,
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
      tenant: result.tenant,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.active) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: user.tenant,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
