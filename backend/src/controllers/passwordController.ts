// backend/src/controllers/passwordController.ts
import { Request, Response } from "express";
import { query } from "../config/database";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import nodemailer from "nodemailer";

// 1. Definisikan tipe untuk User agar tidak menggunakan 'any'
interface User {
    id: number;
    email: string;
    password?: string; // Tanda tanya (?) karena tidak selalu kita select
    role: string;
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email wajib diisi." });
        }

        // 2. Gunakan tipe User yang sudah didefinisikan
        const users: User[] = await query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.json({ message: "Jika email terdaftar, link reset telah dikirim." });
        }
        const user = users[0];

        // ... sisa fungsi forgotPassword Anda tetap sama ...
        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 3600000;
        await query(
            "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
            [resetToken, tokenExpiry, user.id]
        );
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({ /* ...konfigurasi... */ });
        await transporter.sendMail({ /* ...konfigurasi... */ });
        return res.json({ message: "Jika email terdaftar, link reset telah dikirim." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token dan password dibutuhkan.' });
        }

        // 3. Gunakan juga tipe User di sini
        const users: User[] = await query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
            [token, Date.now()]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
        }
        const user = users[0];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
            [hashedPassword, user.id]
        );

        return res.json({ success: true, message: 'Password berhasil direset. Silakan login.' });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};