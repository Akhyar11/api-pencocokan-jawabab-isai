import express from 'express';
import cors from 'cors';
import { getPool, initDB } from './db.js';
import { initAI, evaluasiJawaban, simpanKeChroma } from './ai.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sajikan folder local_model_v2 secara statis agar bisa dibaca secara offline
app.use('/local_model', express.static(path.join(__dirname, 'local_model_v2')));

// Endpoint untuk mengecek jawaban
app.post('/api/cek-jawaban', async (req, res) => {
  const { jawaban_benar, jawaban_user } = req.body;

  if (!jawaban_benar || !jawaban_user) {
    return res.status(400).json({ error: 'Parameter jawaban_benar dan jawaban_user wajib diisi' });
  }

  try {
    // 1. Hitung cosine similarity dengan model (nilai kebenaran)
    const similarity = await evaluasiJawaban(jawaban_benar, jawaban_user);

    // 2. Simpan ke database MySQL
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO hasil_penilaian (jawaban_benar, jawaban_user, cosine_similarity) VALUES (?, ?, ?)',
      [jawaban_benar, jawaban_user, similarity]
    );

    const insertedId = result.insertId;

    // 3. Simpan embedding dan pasangan jawaban ke ChromaDB
    await simpanKeChroma(insertedId, jawaban_benar, jawaban_user, similarity);

    res.json({
      message: 'Evaluasi berhasil diselesaikan dan disimpan',
      data: {
        id: insertedId,
        jawaban_benar,
        jawaban_user,
        cosine_similarity: similarity
      }
    });
  } catch (error) {
    console.error('Error saat mengecek jawaban:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server internal' });
  }
});

// Endpoint untuk melihat riwayat penilaian dari DB MySQL
app.get('/api/riwayat', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM hasil_penilaian ORDER BY created_at DESC');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat' });
  }
});

app.listen(port, async () => {
  console.log(`Server berjalan di port ${port}`);
  await initDB();
  await initAI();
});
