import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getHomepageRecommendations = async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await getConnection();

        // Siapkan semua query yang akan dijalankan
        const queries = {
            akomodasi: connection.query("SELECT id, name, address, thumbnail_picture, 'hotel' as type FROM data_hotel ORDER BY id DESC LIMIT 4"),
            wisata:    connection.query("SELECT id, name, address, thumbnail_picture, 'wisata' as type FROM data_wisata ORDER BY id DESC LIMIT 4"),
            kuliner:   connection.query("SELECT id, name, address, thumbnail_picture, 'kuliner' as type FROM data_kuliner ORDER BY id DESC LIMIT 4")
        };

        // Jalankan semua query secara bersamaan
        const results = await Promise.all(Object.values(queries));

        // Susun data ke dalam format yang diinginkan
        const homepageData = {
        akomodasi: results[0]?.[0] || [],
        wisata:    results[1]?.[0] || [],
        kuliner:   results[2]?.[0] || []
    };

        return res.json({ success: true, data: homepageData });

    } catch (error) {
        console.error("Error fetching homepage recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};