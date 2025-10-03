// File: src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    const sessionToken = req.cookies.get('session_token')?.value;
    const loginUrl = new URL('/login', req.url);

    // Jika mencoba akses halaman admin dan tidak ada token, langsung redirect
    if (!sessionToken) {
        return NextResponse.redirect(loginUrl);
    }

    // Jika token ada, verifikasi keabsahannya
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(sessionToken, secret);
        
        // Verifikasi role
        if (payload.role !== 'ADMIN') {
            // Jika role bukan admin, redirect ke halaman utama
            return NextResponse.redirect(new URL('/', req.url)); 
        }
        
        // Jika token valid dan role adalah ADMIN, izinkan akses
        return NextResponse.next();

    } catch (err) {
        // Jika token tidak valid (error saat verifikasi), redirect ke login
        // dan hapus cookie yang salah
        console.error('Verifikasi token gagal!', err);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('session_token');
        return response;
    }
}

export const config = {
    matcher: ['/admin', '/admin/:path*'], // Melindungi /admin dan semua sub-pathnya
};