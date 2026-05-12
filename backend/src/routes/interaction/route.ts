// backend/src/routes/interaction/route.ts

import express, { Request, Response } from 'express';
// (Sesuaikan path 'query' dan 'authenticate' dengan struktur Anda)
import { query } from '../../lib/db'; 
import { authenticate } from '../../middleware/authMiddleware'; 

const router = express.Router();

// 1. Endpoint untuk "Like" (Toggle)
router.post('/toggle-like', authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.userId; 
    const { businessId } = req.body;

    if (!businessId) {
        return res.status(400).json({ success: false, message: 'Business ID diperlukan' });
    }

    try {
        const existing: any = await query({
            query: 'SELECT * FROM user_interactions WHERE user_id = ? AND business_id = ? AND interaction_type = "like"',
            values: [userId, businessId]
        });

        if (existing.length > 0) {
            // Unlike
            await query({
                query: 'DELETE FROM user_interactions WHERE id = ?',
                values: [existing[0].id]
            });
            return res.json({ success: true, status: 'unliked' }); 
        } else {
            // Like
            await query({
                query: 'INSERT INTO user_interactions (user_id, business_id, interaction_type) VALUES (?, ?, "like")',
                values: [userId, businessId]
            });
            return res.json({ success: true, status: 'liked' });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return res.status(500).json({ success: false, message: 'Server error' }); 
    }
});

// 2. Endpoint untuk "Visit"
router.post('/visit', authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.userId; 
    const { businessId } = req.body;

    if (!businessId) {
        return res.status(400).json({ success: false, message: 'Business ID diperlukan' }); 
    }

    try {
        await query({
            query: 'INSERT INTO user_interactions (user_id, business_id, interaction_type) VALUES (?, ?, "visit")',
            values: [userId, businessId]
        });
        return res.json({ success: true, message: 'Visit recorded' }); 
    } catch (error) {
        console.error('Error recording visit:', error);
        return res.status(200).json({ success: false, message: 'Could not record visit' }); 
    }
});

router.get('/status', authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.userId; // Pastikan menggunakan .userId
    const { businessId } = req.query; // Ambil dari query param (?businessId=...)

    if (!businessId) {
        return res.status(400).json({ success: false, message: 'Business ID diperlukan' });
    }

    try {
        const existing: any = await query({
            query: 'SELECT id FROM user_interactions WHERE user_id = ? AND business_id = ? AND interaction_type = "like"',
            values: [userId, businessId]
        });

        // Kirim balik status 'isFavorite' berdasarkan apakah data ditemukan
        if (existing.length > 0) {
            return res.json({ success: true, isFavorite: true });
        } else {
            return res.json({ success: true, isFavorite: false });
        }
    } catch (error) {
        console.error('Error fetching like status:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/wishlist', authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.userId;

    try {
        // Melakukan JOIN antara user_interactions, businesses, dan categories
        const wishlistItems: any = await query({
            query: `
                SELECT 
                    b.id, 
                    b.name, 
                    b.address, 
                    b.thumbnail_image, 
                    b.average_rating,
                    c.name as category, 
                    c.slug as category_slug
                FROM businesses b
                JOIN user_interactions ui ON b.id = ui.business_id
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE ui.user_id = ? AND ui.interaction_type = 'like'
                ORDER BY ui.created_at DESC
            `,
            values: [userId]
        });

        return res.json({ success: true, data: wishlistItems });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data wishlist' });
    }
});

export default router;