// src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Definisi interface untuk hasil query yang lebih jelas
export interface QueryResult {
    [key: string]: any;
}

// Membuat connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    // port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'batamportal',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Fungsi untuk menjalankan query sederhana dari pool
export const query = async (
    sql: string,
    params?: any[]
): Promise<QueryResult[]> => {
    const [rows] = await pool.execute(sql, params);
    return rows as QueryResult[];
};

// Fungsi untuk mendapatkan koneksi khusus untuk transaksi
export const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        throw new Error(`Failed to get connection from pool: ${(error as Error).message}`);
    }
};