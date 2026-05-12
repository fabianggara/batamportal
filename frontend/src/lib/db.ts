import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',      
  user: 'root',           
  password: '',           // Kosongkan jika menggunakan XAMPP bawaan tanpa password
  database: 'batamportal' // Nama database Anda
});

export default pool;