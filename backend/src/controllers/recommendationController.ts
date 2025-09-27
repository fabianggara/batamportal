import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getRecommendations = async (req: Request, res: Response) => {
    let connection;
    try {
        connection = await getConnection();
        
        const sqlQuery = `
    (SELECT 
        id, name, address, thumbnail_picture, 
        'Akomodasi' AS category,
        'hotel' as type 
    FROM data_hotel ORDER BY id DESC LIMIT 2)
    UNION ALL
    (SELECT 
        id, name, address, thumbnail_picture, 
        'Wisata' AS category,
        'wisata' as type 
    FROM data_wisata ORDER BY id DESC LIMIT 2)
    UNION ALL
    (SELECT 
        id, name, address, thumbnail_picture, 
        'Kuliner' AS category,
        'kuliner' as type 
    FROM data_kuliner ORDER BY id DESC LIMIT 2)
`;
        
        const [results] = await connection.query(sqlQuery);
        return res.json({ success: true, data: results });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};