// backend/src/routes/businessesRoutes.ts

import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { RowDataPacket } from 'mysql2/promise';

const router = Router();

// --- TAMBAHKAN RUTE BARU DI SINI ---
router.get('/category/:categoryName', async (req: Request, res: Response) => {
    // 1. Ambil nama kategori dari parameter URL (misal: "akomodasi")
    const { categoryName } = req.params;

    try {
        // 2. Query untuk mengambil semua item/bisnis dalam kategori tersebut
        const getItemsQuery = `
            SELECT 
                b.id, b.name, b.address, b.average_rating, b.total_reviews, b.star_rating,
                b.thumbnail_image, b.description, b.average_rating, sc.slug as subcategory_slug, b.price
            FROM businesses b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN subcategories sc ON b.subcategory_id = sc.id
            WHERE c.slug = ? AND b.status = 'approved';
        `;
        const items = await query({ query: getItemsQuery, values: [categoryName] });

        // 3. Query untuk mengambil daftar subkategori untuk filter dropdown
        const getSubcategoriesQuery = `
            SELECT s.slug, s.name FROM subcategories s
            JOIN categories c ON s.category_id = c.id
            WHERE c.slug = ?;
        `;
        const subcategories = await query({ query: getSubcategoriesQuery, values: [categoryName] });

        // 4. Query untuk mengambil judul kategori (misal: "Akomodasi")
        const getCategoryTitleQuery = "SELECT name FROM categories WHERE slug = ? LIMIT 1;";
        const categoryTitleResult = await query({ query: getCategoryTitleQuery, values: [categoryName] });
        const categoryTitle = categoryTitleResult[0]?.name || categoryName;
        
        // 5. Kirim semua data dalam format JSON yang diharapkan frontend
        res.json({
            success: true,
            data: {
                items: items,
                subcategories: subcategories,
                category_title: categoryTitle
            }
        });

    } catch (error) {
        console.error(`Error fetching businesses for category ${categoryName}:`, error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


export default router;