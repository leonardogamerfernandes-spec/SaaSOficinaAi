import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { prisma } from "./shared/prisma";
import { sanitizeError } from "./shared/errorHandler";

dotenv.config();

import authRoutes from "./modules/auth/auth.routes";
import customerRoutes from "./modules/customers/customers.routes";
import vehicleRoutes from "./modules/vehicles/vehicles.routes";
import serviceOrderRoutes from "./modules/service-orders/service-orders.routes";
import aiRoutes from "./modules/ai/ai.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import appointmentRoutes from "./modules/appointments/appointments.routes";
import planRoutes from "./modules/plans/plans.routes";
import inspectionRoutes from "./modules/inspections/inspections.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import reminderRoutes from "./modules/reminders/reminders.routes";
import warrantyRoutes from "./modules/warranties/warranties.routes";
import paymentRoutes from "./modules/payments/payments.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration — credentials requires explicit origin, not wildcard
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: corsOrigin === "*"
    ? true // `true` reflects the request origin, compatible with credentials
    : corsOrigin.split(",").map(s => s.trim()),
};
app.use(cors(corsOptions));
app.use(helmet());

app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", time: new Date() });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected", time: new Date() });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/warranties", warrantyRoutes);
app.use("/api/payments", paymentRoutes);

// Global error handler — catches unhandled errors and sanitizes output
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = sanitizeError(err);
  res.status(err.status || 500).json({ error: message });
});

const server = app.listen(PORT, () => {
  console.log(`[OficinaAI Backend] running on http://localhost:${PORT}`);
});

function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
