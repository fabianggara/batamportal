import { Router } from "express";
import { me } from "../../controllers/authController";

const router = Router();

router.get("/", me);

export default router;
