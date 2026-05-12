import express from 'express';
import multer from 'multer';
import path from 'path';
// Mengambil fungsi 'query' dari db.ts
import { query } from '../lib/db'; 
// Sesuaikan path import authenticate dengan lokasi middleware Anda
import { authenticate } from '../middleware/authMiddleware'; 

const router = express.Router();

// --- KONFIGURASI MULTER (Untuk Upload Foto) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Pastikan folder 'uploads' sudah ada di root folder backend Anda
        cb(null, 'uploads/') 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 1. ENDPOINT UNTUK USER BIASA (PROFILE)
// ==========================================

// UPDATE Profil Sendiri (PUT /api/users/profile)
// HARUS diletakkan di atas rute /:id
router.put('/profile', authenticate, upload.single('profile_picture'), async (req: any, res: any) => {
    // Mengambil userId dari token JWT (dari middleware authenticate)
    const userId = req.user.userId;
    const { name } = req.body;
    
    // Jika ada file yang diunggah, ambil nama filenya
    const profilePicture = req.file ? req.file.filename : null;

    try {
        if (profilePicture) {
            // Update nama DAN foto profil
            await query({
                query: 'UPDATE users SET name = ?, profile_picture = ? WHERE id = ?',
                values: [name, profilePicture, userId]
            });
        } else {
            // Update nama saja
            await query({
                query: 'UPDATE users SET name = ? WHERE id = ?',
                values: [name, userId]
            });
        }
        
        res.json({ success: true, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui profil' });
    }
});


// ==========================================
// 2. ENDPOINT UNTUK ADMIN (MANAGE USERS)
// ==========================================

// GET Semua User
router.get('/', async (req, res) => {
    try {
        const rows = await query({
            query: `
                SELECT 
                    id, email, name, profile_picture, bio, 
                    role, is_active, created_at, updated_at 
                FROM users
                ORDER BY created_at DESC
            `
        });

        res.json(rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Gagal mengambil data users' });
    }
});

// UPDATE User oleh Admin (PUT /api/users/:id)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, role, is_active } = req.body;
        // is_active dikonversi menjadi boolean 1 atau 0 untuk MySQL
        const activeStatus = is_active ? 1 : 0; 
        
        await query({
            query: 'UPDATE users SET name = ?, bio = ?, role = ?, is_active = ? WHERE id = ?',
            values: [name, bio, role, activeStatus, id]
        });

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal update user' });
    }
});

// DELETE User oleh Admin (DELETE /api/users/:id)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query({
            query: 'DELETE FROM users WHERE id = ?',
            values: [id]
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal hapus user' });
    }
});

export default router;