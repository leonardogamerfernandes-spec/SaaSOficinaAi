import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Imports modules
import authRoutes from "./modules/auth/auth.routes";
import customerRoutes from "./modules/customers/customers.routes";
import vehicleRoutes from "./modules/vehicles/vehicles.routes";
import serviceOrderRoutes from "./modules/service-orders/service-orders.routes";
import aiRoutes from "./modules/ai/ai.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Base health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/service-orders", serviceOrderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`[OficinaAI Backend] running on http://localhost:${PORT}`);
});
