import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    // Hapus cookie dengan nama 'session_token'
    cookies().delete('session_token');

    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error("API Logout Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}