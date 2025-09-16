// backend/src/controllers/forgotPasswordController.ts
import { Request, Response } from "express";
import { query } from "../config/database";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;

        if (!email) {
        return res.status(400).json({ error: "Email wajib diisi." });
        }

        // Cari user
        const users = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
        return res.json({
            message: "Jika email terdaftar, link reset telah dikirim.",
        });
        }

        const user = users[0]!;

        // Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 3600000; // 1 jam

        await query(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
        [resetToken, tokenExpiry, user.id]
        );

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Email
        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        });

        await transporter.sendMail({
        from: `"Batam Portal" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Reset Password Anda",
        html: `
            <p>Anda meminta untuk mereset password Anda.</p>
            <p>Klik link ini: <a href="${resetUrl}">${resetUrl}</a></p>
            <p>Link ini berlaku 1 jam.</p>
        `,
        });

        return res.json({
        message: "Jika email terdaftar, link reset telah dikirim.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
}
