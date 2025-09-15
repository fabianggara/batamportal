import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { token, password } = await req.json();

        // 1. Validasi input dasar
        if (!token || !password) {
        return NextResponse.json({ error: 'Token dan password dibutuhkan.' }, { status: 400 });
        }
        if (password.length < 6) {
        return NextResponse.json({ error: 'Password minimal harus 6 karakter.' }, { status: 400 });
        }

        // 2. Cari user berdasarkan reset token dan pastikan belum kedaluwarsa
        const users = await query({
            query: "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
            values: [token, Date.now()], 
        });

        if (users.length === 0) {
        return NextResponse.json({ error: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
        }
        const user = users[0];

        // 3. Hash password baru
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update password di database dan hapus token agar tidak bisa digunakan lagi
        await query({
            query: "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
            values: [hashedPassword, user.id],
        });

        return NextResponse.json({ success: true, message: 'Password berhasil direset. Anda akan diarahkan ke halaman login.' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}