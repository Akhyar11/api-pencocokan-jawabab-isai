# API Pencocokan Jawaban (ISAI)

API berbasis Node.js dan Express untuk mencocokkan kemiripan (semantic similarity) antara jawaban pengguna dengan jawaban yang benar. Aplikasi ini menggunakan model TensorFlow **Universal Sentence Encoder** yang berjalan secara **100% Offline** tanpa memerlukan koneksi ke Hugging Face atau layanan eksternal lainnya.

## Fitur Utama
- **Penilaian Semantik Otomatis:** Menggunakan model AI dari Google yang sangat ringan dan cepat (Universal Sentence Encoder).
- **100% Offline:** Model AI telah diunduh secara lokal dan berjalan sepenuhnya tanpa perlu memakan bandwidth internet di setiap inisialisasi.
- **Penyimpanan MySQL:** Hasil penilaian, nilai cosine similarity, dan riwayat pertanyaan otomatis tersimpan ke dalam tabel MySQL.
- **ChromaDB Ready:** Siap dihubungkan ke ChromaDB untuk pencarian vektor lanjutan (opsional).

## Persyaratan Sistem
- Node.js versi 16 atau lebih baru.
- MySQL Server (XAMPP/Laragon/dll).

## Instalasi

1. Clone repositori ini:
   ```bash
   git clone <url-repo-anda>
   cd api-pencocokan-jawabab-isai
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Buat file konfigurasi `.env` di dalam root direktori berdasarkan pengaturan database Anda:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=penilaian_db
   ```

4. Jalankan aplikasi:
   ```bash
   node index.js
   ```

## Endpoint API

### 1. Cek Jawaban
Digunakan untuk mengecek kemiripan jawaban dan menyimpannya secara otomatis ke database.
- **URL:** `/api/cek-jawaban`
- **Method:** `POST`
- **Header:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "jawaban_benar": "Ibukota negara Indonesia adalah Jakarta",
    "jawaban_user": "Jakarta merupakan ibukota Indonesia"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Evaluasi berhasil diselesaikan dan disimpan",
    "data": {
      "id": 1,
      "jawaban_benar": "Ibukota negara Indonesia adalah Jakarta",
      "jawaban_user": "Jakarta merupakan ibukota Indonesia",
      "cosine_similarity": 0.8923
    }
  }
  ```

### 2. Riwayat Penilaian
- **URL:** `/api/riwayat`
- **Method:** `GET`
- **Response:** Mengembalikan seluruh daftar historis pengujian jawaban dari database MySQL.
