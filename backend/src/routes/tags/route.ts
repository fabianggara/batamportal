// backend/src/routes/tags/route.ts

import express, { Request, Response } from 'express';
import { query } from '../../lib/db'; // Sesuaikan path jika perlu

const router = express.Router();

// Menangani: GET /api/tags?type=Area
// Menangani: GET /api/tags?type=Aktivitas
// dll.
router.get('/', async (req: Request, res: Response) => {
    const { type } = req.query;

    if (!type) {
        return res.status(400).json({ success: false, message: 'Parameter "type" diperlukan' });
    }

    try {
        const getTagsQuery = "SELECT id, name FROM tags WHERE type = ?";
        const tags = await query({ query: getTagsQuery, values: [type] });
        
        // @ts-ignore
        if (tags.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        return res.json({ success: true, data: tags });

    } catch (error) {
        console.error(`Error fetching tags for type ${type}:`, error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;