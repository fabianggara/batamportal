// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "@/config/database";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Cari user di DB - AMBIL SEMUA KOLOM PROFIL BARU
        const users: any = await query(
        "SELECT id, email, password, role, name, profile_picture, bio, subscription_status FROM users WHERE email = ?",
        [email]
        );

        if (users.length === 0) {
        return res
            .status(401)
            .json({ success: false, error: "Email atau password salah" });
        }

        const user = users[0];

        // 2. Cek password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
        return res
            .status(401)
            .json({ success: false, error: "Email atau password salah" });
        }

        // 3. Generate JWT
        const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
        );

        // 4. Simpan ke cookie
        res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1 jam
        });

        delete user.password;

        // Response dikembalikan dengan user yang lengkap
        return res.json({ success: true, user });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
    };

    export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validasi input sederhana
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, dan nama wajib diisi." });
        }

        // Cek apakah user sudah ada
        const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email]) as any[];
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: "Email sudah terdaftar." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru ke database
        await query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, 'user'] // Default role 'user'
        );

        return res.status(201).json({ message: "Registrasi berhasil. Silakan login." });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
};

    export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("session_token"); // hapus cookie JWT
        return res.json({ success: true, message: "Logout berhasil" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
    };

    // 🔥 Ambil profil user yang sedang login
    export const me = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.session_token;
        if (!token) {
        return res
            .status(401)
            .json({ success: false, error: "Not authenticated" });
        }

        // verifikasi token
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // ambil user dari DB - AMBIL SEMUA KOLOM PROFIL BARU
        const users: any = await query(
        "SELECT id, email, role, name, profile_picture, bio, subscription_status FROM users WHERE id = ?",
        [decoded.userId]
        );

        if (users.length === 0) {
        return res
            .status(404)
            .json({ success: false, error: "User not found" });
        }

        const user = users[0];
        // Response dikembalikan dengan user yang lengkap
        return res.json(user);
    } catch (error) {
        console.error("Me Error:", error);
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
};