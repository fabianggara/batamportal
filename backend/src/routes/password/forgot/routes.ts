// backend/src/routes/password/forgot/routes.ts
import { Router } from "express";
import { forgotPassword } from "@/controllers/forgotPasswordController";

const router = Router();

// POST /api/password/forgot
router.post("/forgot", forgotPassword);

export default router;
