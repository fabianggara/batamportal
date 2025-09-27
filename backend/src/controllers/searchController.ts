import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const handleSearch = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ success: false, error: "Query pencarian tidak boleh kosong" });
  }

  const searchQuery = `%${query}%`;
  let connection;

  try {
    connection = await getConnection();

    const tablesToSearch = [
      'data_hotel', 'data_wisata', 'data_kuliner',
      'data_kesehatan', 'data_pendidikan', 'data_belanja'
    ];

    const selectClauses = tablesToSearch.map(table => `
      (SELECT id, name, address, thumbnail_picture, '${table.replace('data_', '')}' AS type 
       FROM ${table} 
       WHERE name LIKE ? OR address LIKE ?)
    `);

    const sqlQuery = selectClauses.join(' UNION ALL ') + ' LIMIT 25;';

    // Membuat array parameter secara dinamis
    const params = tablesToSearch.flatMap(() => [searchQuery, searchQuery]);

    const [results] = await connection.query(sqlQuery, params);

    return res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error("Error saat melakukan pencarian:", error);
    return res.status(500).json({ success: false, error: "Terjadi kesalahan pada server" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};