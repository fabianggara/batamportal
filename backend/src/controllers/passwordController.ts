// src/controllers/passwordController.ts
import { Request, Response } from "express";
import { query } from "../config/database";
import crypto from "crypto";
import bcrypt from 'bcryptjs';
import nodemailer from "nodemailer";
import { User } from '../models/user';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true untuk port 465, false untuk lainnya
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email wajib diisi." });
        }

        const users = await query("SELECT * FROM users WHERE email = ?", [email]) as User[];
        const user = users[0];

        if (!user) {
            return res.json({ message: "Jika email terdaftar, link reset telah dikirim." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 3600000;

        await query(
            "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
            [resetToken, tokenExpiry, user.id]
        );

        const resetUrl = `${process.env.FRONTEND_URL}/login/reset-password?token=${resetToken}`;
        
        // --- PERBAIKAN 2: Gunakan transporter yang sudah dibuat ---
        await transporter.sendMail({
            from: `"Batam Portal" <${process.env.SMTP_FROM_EMAIL}>`, 
            to: user.email,
            subject: "Reset Password Akun Anda",
            html: `<p>Anda meminta untuk mereset password. Klik link di bawah untuk melanjutkan:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>Link ini hanya berlaku selama 1 jam.</p>`,
        });

        return res.json({ message: "Jika email terdaftar, link reset telah dikirim." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
};


// Fungsi untuk mereset password dengan token
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token dan password baru dibutuhkan.' });
        }

        const users = await query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
            [token, Date.now()]
        ) as User[];

        // --- PERBAIKAN DIMULAI ---
        const user = users[0];

        if (!user) {
            return res.status(400).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
        }
        // --- PERBAIKAN SELESAI ---

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
            [hashedPassword, user.id]
        );

        return res.json({ message: 'Password berhasil direset. Silakan login.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

// Fungsi untuk mengganti password (user harus login)
export const changePassword = async (req: Request, res: Response) => {
    try {
            const userId = req.user?.userId; 
        if (!userId) {
            return res.status(401).json({ error: "Tidak terautentikasi." });
        }

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Password lama dan baru dibutuhkan." });
        }

        const users = await query("SELECT * FROM users WHERE id = ?", [userId]) as User[];
        
        // --- PERBAIKAN DIMULAI ---
        const user = users[0];

        if (!user) {
            return res.status(404).json({ error: "User tidak ditemukan." });
        }
        // --- PERBAIKAN SELESAI ---

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password lama tidak cocok." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        return res.json({ message: "Password berhasil diubah." });
    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
};