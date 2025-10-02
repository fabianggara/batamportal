// recommendationController.ts (VERSI BARU)

import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getRecommendations = async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Query tunggal yang efisien, menggantikan UNION ALL
        const sqlQuery = `
            WITH RankedSubmissions AS (
                SELECT
                    id, name, address, thumbnail_image, category_id,
                    ROW_NUMBER() OVER(PARTITION BY category_id ORDER BY published_at DESC) as row_num
                FROM
                    businesses
                WHERE
                    status = 'approved' AND category_id IN (1, 2, 3) -- Asumsi: 1:Akomodasi, 2:Kuliner, 3:Wisata
            )
            SELECT id, name, address, thumbnail_image, category_id
            FROM RankedSubmissions
            WHERE row_num <= 2; -- Mengambil 2 item teratas per kategori
        `;
        
        const [results] = await connection.query(sqlQuery);

        // Buat pemetaan dari category_id ke nama kategori dan tipe URL
        const categoryMap: { [key: number]: { category: string, type: string } } = {
            1: { category: 'Akomodasi', type: 'akomodasi' },
            2: { category: 'Kuliner',    type: 'kuliner' },
            3: { category: 'Wisata',   type: 'wisata' }
        };

        let formattedResults: any[] = [];
        if (Array.isArray(results)) {
            // Proses hasil untuk menambahkan kembali field 'category' dan 'type'
            formattedResults = results.map((item: any) => {
                const mapping = categoryMap[item.category_id];
                return {
                    id: item.id,
                    name: item.name,
                    address: item.address,
                    thumbnail_image: item.thumbnail_image,
                    category: mapping ? mapping.category : 'Unknown', // Fallback
                    type: mapping ? mapping.type : 'unknown'        // Fallback
                };
            });
        }

        return res.json({ success: true, data: formattedResults });

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};