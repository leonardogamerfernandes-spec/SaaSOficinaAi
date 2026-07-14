import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { requirePlan } from "../../shared/planGate";
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "./inventory.controller";

const router = Router();

router.use(authMiddleware);
router.use(requirePlan("PRO")); // Pro gated

router.get("/", listInventory);
router.post("/", createInventoryItem);
router.put("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);

export default router;
