// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Find the user by email
    const users = await query({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // Compare the provided password with the stored hash
    const passwordsMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordsMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }
    
    // In a real app, you would create a session/JWT here
    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}