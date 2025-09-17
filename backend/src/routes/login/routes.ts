// backend/src/routes/login/routes.ts
import { Router, Request, Response } from "express";
import { query } from "../../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Cek user di database
        const users: any = await query(
            "SELECT id, email, password, role FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
        return res.status(401).json({ success: false, error: "Email atau password salah" });
        }

        const user = users[0];

        // 2. Cocokkan password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
        return res.status(401).json({ success: false, error: "Email atau password salah" });
        }

        // 3. Buat JWT
        const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default-secret",
        { expiresIn: "1h" }
        );

        // 4. Kirim cookie + response
        res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1 jam dalam ms
        });

        delete user.password;

        return res.json({ success: true, user });
    } catch (error) {
        console.error("Login API Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
