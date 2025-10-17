// backend/src/routes/businessesRoutes.ts

import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// =================================================================
// Rute SPESIFIK ('/category/...') harus di ATAS
// =================================================================
// Menangani: GET /api/businesses/category/akomodasi
router.get('/category/:categoryName', async (req: Request, res: Response) => {
    const { categoryName } = req.params;
    try {
        const getItemsQuery = `
            SELECT 
                b.id, b.name, b.address, b.average_rating, b.total_reviews, b.star_rating,
                b.thumbnail_image, b.description, b.price, b.latitude, b.longitude,
                sc.slug as subcategory_slug
            FROM businesses b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN subcategories sc ON b.subcategory_id = sc.id
            WHERE c.slug = ? AND b.status = 'approved';
        `;
        const items = await query({ query: getItemsQuery, values: [categoryName] });

        const getSubcategoriesQuery = `
            SELECT s.slug, s.name FROM subcategories s
            JOIN categories c ON s.category_id = c.id
            WHERE c.slug = ?;
        `;
        const subcategories = await query({ query: getSubcategoriesQuery, values: [categoryName] });

        const getCategoryTitleQuery = "SELECT name FROM categories WHERE slug = ? LIMIT 1;";
        const categoryTitleResult = await query({ query: getCategoryTitleQuery, values: [categoryName] });
        const categoryTitle = categoryTitleResult[0]?.name || categoryName;
        
        return res.json({
            success: true,
            data: {
                items: items,
                subcategories: subcategories,
                category_title: categoryTitle
            }
        });
    } catch (error) {
        console.error(`Error fetching businesses for category ${categoryName}:`, error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// =================================================================
// Rute UMUM ('/:businessId') harus di BAWAH
// INI ADALAH KODE YANG HILANG
// =================================================================
// Menangani: GET /api/businesses/5, GET /api/businesses/12, dst.
router.get('/:businessId', async (req: Request, res: Response) => {
    const { businessId } = req.params;
    try {
        if (!businessId || isNaN(parseInt(businessId))) {
           return res.status(400).json({ success: false, message: "Invalid or missing business ID" });
        }

        const getBusinessQuery = "SELECT * FROM businesses WHERE id = ? AND status = 'approved' LIMIT 1;";
        const businesses = await query({ query: getBusinessQuery, values: [businessId] });

        if (businesses.length === 0) {
            return res.status(404).json({ success: false, message: "Business not found or not approved" });
        }
        return res.json({ success: true, data: businesses[0] });
    } catch (error) {
        console.error(`Error fetching business with ID ${businessId}:`, error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;