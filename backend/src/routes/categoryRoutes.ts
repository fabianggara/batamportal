// backend/src/routes/categoryRoutes.ts

import { Router, Request, Response } from 'express';
import { query } from '../lib/db'; 
import { RowDataPacket } from 'mysql2/promise'; 

// Interface untuk Kategori Utama (Sudah ada)
interface CategoryQueryResult extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  item_count: number;
}

// --- TAMBAHAN 1: Interface untuk Subkategori ---
interface SubcategoryQueryResult extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

const router = Router();

// 1. Route Ambil Semua Kategori (Sudah ada punya Anda)
router.get('/', async (req: Request, res: Response) => {
  try {
    const sqlQuery = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.is_featured,
        COUNT(b.id) AS item_count
      FROM categories c
      LEFT JOIN businesses b ON c.id = b.category_id
      GROUP BY c.id, c.name, c.slug, c.description, c.is_featured
      ORDER BY c.name ASC;
    `;
    
    const categories = await query<CategoryQueryResult[]>({ query: sqlQuery });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// --- TAMBAHAN 2: Route Baru untuk Ambil Subkategori ---
// URL nanti: /api/categories/2/subcategories
router.get('/:categoryId/subcategories', async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      
      const sqlQuery = `
        SELECT id, name, slug 
        FROM subcategories 
        WHERE category_id = ? AND is_active = 1 
        ORDER BY name ASC
      `;
      
      // Mengirim query dengan parameter (values) agar aman
      const subcategories = await query<SubcategoryQueryResult[]>({ 
          query: sqlQuery,
          values: [categoryId] 
      });
      
      res.json({
        success: true,
        data: subcategories
      });
  
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;