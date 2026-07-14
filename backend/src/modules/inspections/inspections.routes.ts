import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import { getInspection, upsertInspection } from "./inspections.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:id", getInspection);
router.post("/:id", upsertInspection);

export default router;
