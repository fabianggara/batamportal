// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // <-- Impor cookies

export async function POST(req) {
    try {
        const { email, password } = await req.json();

    // 1. Ambil user beserta rolenya
    const users = await query({
        query: "SELECT id, email, password_hash, role FROM users WHERE email = ?",
        values: [email],
    });

    if (users.length === 0) {
        return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 401 });
    }
    const user = users[0];

    const passwordsMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordsMatch) {
        return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 401 });
    }
    
    // 2. Buat JWT jika login berhasil
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET, // Pastikan Anda punya JWT_SECRET di file .env.local
        { expiresIn: '1h' }
    );

    // 3. Simpan token di httpOnly cookie
    cookies().set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 jam
        path: '/',
    });

    // 4. Hapus hash password sebelum mengirim data user
    delete user.password_hash;
    
    // Kirim kembali data user
    return NextResponse.json({ success: true, user: user });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}