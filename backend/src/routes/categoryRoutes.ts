// backend/src/routes/categoryRoutes.ts

import { Router, Request, Response } from 'express';
import { query } from '../lib/db'; 
import { RowDataPacket } from 'mysql2/promise'; // Pastikan ini diimpor

interface CategoryQueryResult extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  item_count: number;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {  try {
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

export default router;