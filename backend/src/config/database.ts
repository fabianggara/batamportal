// src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface QueryResult {
    [key: string]: any;
}

export async function query(
    query: string, 
    values: any[] = []
): Promise<QueryResult[]> {
    const dbconnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || '',
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    });

    try {
        const [results] = await dbconnection.execute(query, values);
        dbconnection.end();
        return results as QueryResult[];
    } catch (error) {
        dbconnection.end();
        throw new Error(`Database query error: ${(error as Error).message}`);
    }
}