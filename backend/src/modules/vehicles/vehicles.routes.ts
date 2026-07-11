import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "./vehicles.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listVehicles);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

export default router;
