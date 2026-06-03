# 📘 Dokumentasi API Pencocokan Jawaban (ISAI)

Dokumentasi ini ditujukan untuk tim Frontend Developer (FE) guna memudahkan integrasi dengan backend AI Pencocokan Jawaban. API ini sudah mendukung **CORS**, sehingga bisa dipanggil langsung dari domain frontend manapun (seperti React, Vue, Next.js, dsb).

**Base URL Lokal:** `http://localhost:3000`

---

## 1. Mengecek Kemiripan Jawaban
Digunakan untuk membandingkan kecocokan antara jawaban yang seharusnya benar dengan jawaban yang diinputkan oleh pengguna (mahasiswa/siswa). API ini akan mengembalikan **nilai kebenaran (Cosine Similarity)** dari `0.0` (sangat berbeda) hingga `1.0` (sangat identik) menggunakan *Universal Sentence Encoder*. Data akan otomatis tersimpan di database MySQL.

- **URL:** `/api/cek-jawaban`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type: application/json`

### 📥 Request Body
```json
{
  "jawaban_benar": "Ibukota negara Indonesia adalah Jakarta",
  "jawaban_user": "Jakarta merupakan ibukota Indonesia"
}
```

### 📤 Success Response (200 OK)
```json
{
  "message": "Evaluasi berhasil diselesaikan dan disimpan",
  "data": {
    "id": 1,
    "jawaban_benar": "Ibukota negara Indonesia adalah Jakarta",
    "jawaban_user": "Jakarta merupakan ibukota Indonesia",
    "cosine_similarity": 0.8923714
  }
}
```

### 💻 Contoh Penggunaan di Frontend (Javascript / React)
```javascript
// Menggunakan Fetch API
async function submitJawaban() {
  const payload = {
    jawaban_benar: "Sistem operasi adalah perangkat lunak sistem yang mengatur sumber daya dari perangkat keras",
    jawaban_user: "Software pengatur hardware"
  };

  try {
    const response = await fetch('http://localhost:3000/api/cek-jawaban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log("Nilai Skor Kebenaran: ", result.data.cosine_similarity);
    
    // Tampilkan nilai ke UI, misal jika similarity > 0.7 artinya "Benar"
    if (result.data.cosine_similarity > 0.7) {
      alert("Jawaban Benar!");
    } else {
      alert("Jawaban Kurang Tepat");
    }
  } catch (error) {
    console.error("Gagal terhubung ke API:", error);
  }
}
```

---

## 2. Mengambil Riwayat Semua Penilaian
Digunakan untuk menampilkan daftar riwayat jawaban pengguna yang sebelumnya telah divalidasi dan tersimpan di database. Data diurutkan dari yang paling baru ke paling lama (Descending).

- **URL:** `/api/riwayat`
- **Method:** `GET`

### 📤 Success Response (200 OK)
```json
{
  "data": [
    {
      "id": 2,
      "jawaban_benar": "Sistem operasi adalah...",
      "jawaban_user": "Software pengatur hardware",
      "cosine_similarity": 0.6582,
      "created_at": "2026-06-03T08:50:00.000Z"
    },
    {
      "id": 1,
      "jawaban_benar": "Ibukota negara Indonesia adalah Jakarta",
      "jawaban_user": "Jakarta merupakan ibukota Indonesia",
      "cosine_similarity": 0.8923,
      "created_at": "2026-06-03T08:48:00.000Z"
    }
  ]
}
```

### 💻 Contoh Penggunaan di Frontend (Javascript / React)
```javascript
// Menggunakan Fetch API
async function loadRiwayat() {
  try {
    const response = await fetch('http://localhost:3000/api/riwayat');
    const result = await response.json();
    
    // Looping data untuk dirender ke tabel (misalnya state React)
    console.log(result.data);
    // setRiwayatList(result.data); // Contoh pada React
  } catch (error) {
    console.error("Gagal memuat riwayat:", error);
  }
}
```
