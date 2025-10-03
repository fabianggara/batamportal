import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getHotelById = async (req: Request, res: Response) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  let connection;

  try {
    connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM data_hotel WHERE id = ?', [id]);
    
    // Pastikan rows adalah array dan tidak kosong
    const results = rows as any[];
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "Hotel tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: results[0] });

  } catch (error) {
    console.error(`Error mengambil data hotel dengan id ${id}:`, error);
    return res.status(500).json({ success: false, error: "Terjadi kesalahan pada server" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};