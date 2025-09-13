// middleware.js atau src/middleware.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('session_token')?.value;
  const loginUrl = new URL('/login', req.url);

  if (!sessionToken) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionToken, secret);
    
    if (payload.role !== 'ADMIN') {
      // Jika bukan admin, tendang ke halaman utama
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Izinkan akses jika token valid dan role adalah ADMIN
    return NextResponse.next();
  } catch (err) {
    // Jika token tidak valid, arahkan ke login dan hapus cookie lama
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_token');
    return response;
  }
}

// Tentukan rute mana yang dilindungi
export const config = {
  matcher: '/admin/:path*',
};