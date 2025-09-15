// src/app/api/signup/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // Check if user already exists
        const existingUser = await query({
            query: "SELECT * FROM users WHERE email = ?",
            values: [email],
        });

        if (existingUser.length > 0) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const result = await query({
            query: "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            values: [email, hashedPassword],
        });

        return NextResponse.json({ success: true, userId: result.insertId });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}