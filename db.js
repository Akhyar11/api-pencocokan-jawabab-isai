import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'penilaian_db';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;

export const initDB = async () => {
  try {
    // 1. Buat koneksi sementara tanpa menentukan database
    const connection = await mysql.createConnection(dbConfig);
    
    // 2. Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 3. Inisialisasi pool dengan database yang sudah dipastikan ada
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 4. Buat tabel
    const poolConnection = await pool.getConnection();
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS hasil_penilaian (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jawaban_benar TEXT NOT NULL,
        jawaban_user TEXT NOT NULL,
        cosine_similarity FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    poolConnection.release();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const getPool = () => pool;
