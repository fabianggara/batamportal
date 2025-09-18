// backend/src/routes/logout/routes.ts
import { Router, Request, Response } from "express";

const router = Router();

router.post("/", (req: Request, res: Response) => {
    // Hapus cookie dengan nama yang sama dan path yang sama
    res.clearCookie("session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        path: '/',
    });

    return res.status(200).json({ success: true, message: "Logout berhasil" });
});

export default router;