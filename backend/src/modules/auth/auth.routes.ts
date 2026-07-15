import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "./auth.controller";

const router = Router();

// Stricter rate limit for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
