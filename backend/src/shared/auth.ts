import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("[OficinaAI] JWT_SECRET environment variable is required but not set.");
  }
  return secret;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export function signToken(payload: { id: string; email: string; role: string; tenantId: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token format error" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: string;
      email: string;
      role: string;
      tenantId: string;
    };

    (req as AuthenticatedRequest).user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
