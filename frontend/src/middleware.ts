// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    console.log(`\n--- Middleware berjalan untuk: ${req.nextUrl.pathname} ---`);
    const sessionToken = req.cookies.get('session_token')?.value;
    const loginUrl = new URL('/login', req.url);

    if (!sessionToken) {
        console.log('Tidak ada session_token, mengarahkan ke /login.');
        return NextResponse.redirect(loginUrl);
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(sessionToken, secret);
        
        // LOG PALING PENTING: Tampilkan isi token
        console.log('Verifikasi token berhasil! Payload token:', payload);
        
        if (payload.role !== 'ADMIN') {
            console.log(`Pengecekan role gagal. Role pengguna: "${payload.role}", dibutuhkan: "ADMIN"`);
            return NextResponse.redirect(new URL('/', req.url)); // Arahkan ke halaman utama jika bukan admin
        }
        
        console.log('Otentikasi & Otorisasi berhasil! Mengizinkan akses.');
        return NextResponse.next();

    } catch (err) {
        console.error('Verifikasi token gagal! Error:', err instanceof Error ? err.message : err);
        
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('session_token');
        return response;
    }
}

export const config = {
    matcher: '/admin/:path*',
};