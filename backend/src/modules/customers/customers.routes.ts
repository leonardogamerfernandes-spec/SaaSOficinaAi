import { Router } from "express";
import { authMiddleware } from "../../shared/auth";
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customers.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
