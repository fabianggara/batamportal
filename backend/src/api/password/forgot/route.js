import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    // 1. Cari user berdasarkan email
    const users = await query({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    });

    if (users.length === 0) {
      // Kirim respons sukses meskipun email tidak ditemukan untuk alasan keamanan
      return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
    }
    const user = users[0];

    // 2. Buat token reset yang aman dan acak
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // Token berlaku selama 1 jam

    // 3. Simpan token dan waktu kedaluwarsa ke database
    await query({
      query: "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      values: [resetToken, tokenExpiry, user.id],
    });

    // 4. Buat link reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // 5. Konfigurasi Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 6. Kirim email
    await transporter.sendMail({
  from: `"Batam Portal (Dev)" <okeangga30@gmail.com>`, // <-- GANTI DENGAN EMAIL ANDA
  to: user.email,
  subject: 'Reset Password Anda',
  html: `<p>Anda meminta untuk mereset password Anda.</p>
         <p>Klik link ini untuk melanjutkan: <a href="${resetUrl}">${resetUrl}</a></p>
         <p>Link ini akan kedaluwarsa dalam 1 jam.</p>`,
});

    return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}