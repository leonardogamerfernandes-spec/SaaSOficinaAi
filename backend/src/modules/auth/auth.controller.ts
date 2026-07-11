import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../shared/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "oficinaai-super-secret-key-12345";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

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

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          cnpj,
          phone,
          address,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashPassword(password),
          role: "ADMIN",
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.tenant.id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
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

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: user.tenant,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
