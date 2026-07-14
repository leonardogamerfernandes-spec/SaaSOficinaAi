import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { requirePlan } from "../../shared/planGate";
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "./reminders.controller";

const router = Router();

router.use(authMiddleware);
router.use(requirePlan("PRO")); // Pro gated

router.get("/", listReminders);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
