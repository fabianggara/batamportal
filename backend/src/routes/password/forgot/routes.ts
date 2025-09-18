// backend/src/routes/password/forgot/routes.ts
import { Router } from "express";
import { forgotPassword } from "../../../controllers/passwordController";

const router = Router();

router.post("/", forgotPassword);

export default router;