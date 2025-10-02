// homepageController.ts (VERSI BARU)

import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getHomepageRecommendations = async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await getConnection();

        // Query tunggal yang efisien menggunakan Window Function
        const sqlQuery = `
            WITH RankedSubmissions AS (
                SELECT
                    id, name, address, thumbnail_image, category_id,
                    ROW_NUMBER() OVER(PARTITION BY category_id ORDER BY published_at DESC) as row_num
                FROM
                    businesses
                WHERE
                    status = 'approved' AND category_id IN (1, 2, 3) -- Asumsi: 1:Akomodasi, 2:Wisata, 3:Kuliner
            )
            SELECT id, name, address, thumbnail_image, category_id
            FROM RankedSubmissions
            WHERE row_num <= 4;
        `;

        const [results] = await connection.query(sqlQuery);

        // Siapkan objek untuk menampung hasil
        const homepageData: { [key: string]: any[] } = {
            akomodasi: [],
            wisata: [],
            kuliner: []
        };
        
        // Buat pemetaan dari category_id ke nama kunci dan tipe URL
        const categoryMap: { [key: number]: { key: string, type: string } } = {
            1: { key: 'akomodasi', type: 'akomodasi' },
            2: { key: 'wisata', type: 'wisata' },
            3: { key: 'kuliner', type: 'kuliner' }
        };

        // Proses hasil query untuk dikelompokkan berdasarkan kategori
        if (Array.isArray(results)) {
            results.forEach((item: any) => {
                const mapping = categoryMap[item.category_id];
                if (mapping) {
                    // Tambahkan 'type' agar sesuai dengan kebutuhan frontend untuk routing
                    const formattedItem = { ...item, type: mapping.type };
                    delete formattedItem.category_id; // Hapus category_id jika tidak perlu
                    homepageData[mapping.key]!.push(formattedItem);
                }
            });
        }

        return res.json({ success: true, data: homepageData });

    } catch (error) {
        console.error("Error fetching homepage recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};