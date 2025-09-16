import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    // 1. Verifikasi sesi pengguna dari cookie (sudah benar, tidak perlu await)
    const cookieStore = cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    // 2. Ambil password dari body request
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Input tidak valid.' }, { status: 400 });
    }

    // 3. Ambil data pengguna dari database menggunakan fungsi 'query'
    const users = await query({
      query: "SELECT * FROM users WHERE id = ?",
      values: [userId],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }
    const user = users[0];

    // 4. Verifikasi password saat ini
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 403 });
    }

    // 5. Hash dan simpan password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await query({
      query: "UPDATE users SET password_hash = ? WHERE id = ?",
      values: [hashedNewPassword, userId],
    });

    return NextResponse.json({ success: true, message: 'Password berhasil diubah.' });

  } catch (error) {
    console.error(error);
    if (error.name === 'JWTExpired') {
        return NextResponse.json({ error: 'Sesi telah berakhir, silakan login kembali.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}