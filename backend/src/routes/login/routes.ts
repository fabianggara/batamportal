// backend/src/routes/login/routes.ts
import { Router } from "express";
import { login } from "../../controllers/authController";

const router = Router();

router.post("/", login);

export default router;
