// backend/src/lib/db.ts
import mysql, { RowDataPacket } from "mysql2/promise";

interface QueryOptions {
  query: string;
  values?: any[];
}

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(
  { query, values = [] }: QueryOptions
): Promise<T> {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  try {
    const [results] = await connection.execute<T>(query, values);
    return results;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await connection.end();
  }
}
