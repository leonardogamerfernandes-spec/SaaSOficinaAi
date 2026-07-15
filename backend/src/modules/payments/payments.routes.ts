import { Router } from "express";
import { createCheckout, handleWebhook } from "./payments.controller";
import { authMiddleware } from "../../shared/auth";

const router = Router();

// Endpoint to create checkout preference - needs authentication
router.post("/checkout", authMiddleware, createCheckout);

// Webhook callback endpoint - public (called by Mercado Pago)
router.post("/webhook", handleWebhook);

export default router;
