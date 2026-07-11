import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import {
  listServiceOrders,
  getServiceOrder,
  createServiceOrder,
  updateServiceOrder,
  addServiceItem,
  removeServiceItem,
  aiAnalyzeServiceOrder,
} from "./service-orders.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listServiceOrders);
router.post("/", createServiceOrder);
router.get("/:id", getServiceOrder);
router.put("/:id", updateServiceOrder);

// Manage items in order
router.post("/:id/items", addServiceItem);
router.delete("/:id/items/:itemId", removeServiceItem);

// AI diagnosis helper
router.post("/:id/ai-analyze", aiAnalyzeServiceOrder);

export default router;
