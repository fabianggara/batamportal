import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../config/database';

const router = Router();

// POST /api/signup
router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Cek apakah user sudah ada
        const existingUser = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
        return res.status(409).json({ success: false, error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user baru
        const result = await query(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, hashedPassword]
        );

        return res.status(201).json({
        success: true,
        userId: (result as any).insertId,
        message: 'Signup successful',
        });
    } catch (error) {
        console.error("Signup API Error:", error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
