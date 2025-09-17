// Backend/src/routes/signup/routes.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../config/database';

const router = Router();

// POST /api/signup
router.post('/', async (req: Request, res: Response) => {
    try {
        console.log('Signup request body:', req.body); // Debug log
        
        // Destructure all fields from request body - FIXED: menggunakan 'password' bukan 'password_hash'
        const { name, email, password } = req.body;

        // Validation - check required fields
        if (!name || !email || !password) {
            console.log('Missing fields:', { name: !!name, email: !!email, password: !!password });
            return res.status(400).json({ 
                success: false, 
                error: 'Nama, email, dan password wajib diisi',
                field: !name ? 'name' : !email ? 'email' : 'password'
            });
        }

        // Validate name length
        if (name.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nama minimal 2 karakter',
                field: 'name'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Format email tidak valid',
                field: 'email'
            });
        }

        // Validate password length - FIXED: menggunakan 'password' bukan 'password_hash'
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password minimal 6 karakter',
                field: 'password'
            });
        }

        // Check if user already exists
        const existingUser = await query(
            "SELECT id FROM users WHERE email = ?", 
            [email.toLowerCase().trim()]
        );
        
        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false, 
                error: 'Email sudah terdaftar. Silakan gunakan email lain.',
                field: 'email'
            });
        }

        // Hash password - FIXED: menggunakan 'password' bukan 'password_hash'
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Get current timestamp
        const currentTimestamp = new Date();

        // Insert new user with all required fields
        const result = await query(`
            INSERT INTO users (
                name, 
                email, 
                password, 
                role, 
                is_active, 
                created_at, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            name.trim(),
            email.toLowerCase().trim(),
            hashedPassword,
            'USER', // Default role
            true, // Default active status
            currentTimestamp,
            currentTimestamp
        ]);

        const insertResult = result as any;
        const userId = insertResult.insertId;

        console.log('User created successfully:', userId);

        // Return success response without sensitive data
        return res.status(201).json({
            success: true,
            message: 'Pendaftaran berhasil! Silakan login dengan akun Anda.',
            user: {
                id: userId,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                role: 'USER'
            }
        });

    } catch (error) {
        console.error("Signup API Error:", error);

        // Handle specific database errors
        if (error instanceof Error) {
            console.error("Error details:", error.message);
            
            // Duplicate entry error (MySQL error code 1062)
            if (error.message.includes('Duplicate entry')) {
                return res.status(409).json({ 
                    success: false, 
                    error: 'Email sudah terdaftar',
                    field: 'email'
                });
            }

            // Handle other database constraint errors
            if (error.message.includes('constraint')) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Data tidak valid. Silakan periksa kembali.'
                });
            }
        }

        return res.status(500).json({ 
            success: false, 
            error: 'Terjadi kesalahan server. Silakan coba lagi.'
        });
    }
});

export default router;