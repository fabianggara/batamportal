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

    // Query tunggal yang mencari di beberapa kolom pada tabel businesses
    // dan mengambil 'slug' kategori sebagai 'type' untuk routing di frontend.
    const sqlQuery = `
      SELECT
        b.id,
        b.name,
        b.address,
        b.thumbnail_image,
        c.slug AS type 
      FROM
        businesses AS b
      LEFT JOIN
        categories AS c ON b.category_id = c.id
      WHERE
        (b.name LIKE ? OR b.address LIKE ? OR b.description LIKE ? OR c.name LIKE ?)
      AND b.status = 'approved'
      LIMIT 25;
    `;

    const params = [searchQuery, searchQuery, searchQuery, searchQuery];

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