import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "./appointments.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
