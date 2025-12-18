# API Documentation - Sistem Soal dan Jawaban

## Base URL
```
http://localhost:3000
```

## 📚 SOAL ENDPOINTS

### 1. POST /soals - Membuat Soal Baru
```http
POST /soals
Content-Type: application/json

{
  "kode": "MATH001",
  "judul": "Matematika Dasar",
  "soal": [
    {
      "type": "pilihan ganda",
      "soal": "Berapa hasil 2 + 2?",
      "list_jawaban": ["a. 3", "b. 4", "c. 5", "d. 6"],
      "jawaban": "b"
    },
    {
      "type": "pilihan ganda", 
      "soal": "Berapa hasil 5 x 3?",
      "list_jawaban": ["a. 15", "b. 20", "c. 25", "d. 30"],
      "jawaban": "a"
    },
    {
      "type": "essay",
      "soal": "Jelaskan konsep matematika dasar!",
      "jawaban": "Matematika dasar adalah fondasi..."
    }
  ]
}
```

### 2. GET /soals - Ambil Semua Soal
```http
GET /soals
```

### 3. GET /soals/:_id - Ambil Soal by ID
```http
GET /soals/674dd14ad967cab43b7af5c4c
```

### 4. PUT /soals/:_id - Update Soal
```http
PUT /soals/674dd14ad967cab43b7af5c4c
Content-Type: application/json

{
  "judul": "Matematika Dasar - Updated",
  "soal": [
    {
      "type": "pilihan ganda",
      "soal": "Berapa hasil 3 + 3?",
      "list_jawaban": ["a. 5", "b. 6", "c. 7", "d. 8"],
      "jawaban": "b"
    }
  ]
}
```

### 5. DELETE /soals/:_id - Hapus Soal
```http
DELETE /soals/674dd14ad967cab43b7af5c4c
```

## 📝 ANSWER ENDPOINTS

### 1. GET /answer/:kode - Ambil Soal untuk Dijawab
```http
GET /answer/MATH001
```

**Response:**
```json
{
  "success": true,
  "message": "Soal berhasil diambil",
  "data": {
    "_id": "674dd14ad967cab43b7af5c4c",
    "kode": "MATH001",
    "judul": "Matematika Dasar",
    "soal": [
      {
        "nomor": 1,
        "type": "pilihan ganda",
        "soal": "Berapa hasil 2 + 2?",
        "list_jawaban": ["a. 3", "b. 4", "c. 5", "d. 6"]
      },
      {
        "nomor": 2,
        "type": "pilihan ganda",
        "soal": "Berapa hasil 5 x 3?",
        "list_jawaban": ["a. 15", "b. 20", "c. 25", "d. 30"]
      },
      {
        "nomor": 3,
        "type": "essay",
        "soal": "Jelaskan konsep matematika dasar!"
      }
    ]
  },
  "format_jawaban": {
    "description": "Format untuk menjawab soal",
    "example": {
      "1": "a",
      "2": "b", 
      "3": "ini jawaban essay"
    }
  }
}
```

### 2. POST /answer/:kode - Submit Jawaban
```http
POST /answer/MATH001
Content-Type: application/json

{
  "jawaban": {
    "1": "b",
    "2": "a",
    "3": "Matematika dasar adalah ilmu yang mempelajari angka dan operasi dasar seperti penjumlahan, pengurangan, perkalian dan pembagian."
  },
  "user_id": "674dd14ad967cab43b7af5c4c"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan",
  "data": {
    "answer_id": "674dd14ad967cab43b7af5c4d",
    "kode_soal": "MATH001",
    "score": 2,
    "total_soal": 3,
    "jawaban": {
      "1": "b",
      "2": "a", 
      "3": "Matematika dasar adalah..."
    },
    "status": "graded"
  }
}
```

### 3. GET /answer/results/all - Semua Jawaban
```http
GET /answer/results/all
```

### 4. GET /answer/results/:kode - Jawaban by Kode
```http
GET /answer/results/MATH001
```

## 🔍 CONTOH TESTING

### Test dengan cURL:

1. **Buat Soal:**
```bash
curl -X POST http://localhost:3000/soals \
  -H "Content-Type: application/json" \
  -d '{
    "kode": "TEST001",
    "judul": "Test Soal",
    "soal": [
      {
        "type": "pilihan ganda",
        "soal": "Test question?",
        "list_jawaban": ["a. Option A", "b. Option B"],
        "jawaban": "a"
      }
    ]
  }'
```

2. **Ambil Soal:**
```bash
curl http://localhost:3000/answer/TEST001
```

3. **Submit Jawaban:**
```bash
curl -X POST http://localhost:3000/answer/TEST001 \
  -H "Content-Type: application/json" \
  -d '{
    "jawaban": {
      "1": "a"
    }
  }'
```

## 📊 SCORING SYSTEM

- **Pilihan Ganda**: 1 point per jawaban benar
- **Essay**: Manual grading (score 0 otomatis, perlu grading manual)
- **Status**: 
  - `graded`: Sudah dinilai
  - `pending`: Menunggu penilaian (untuk essay)

## 🗂️ DATABASE COLLECTIONS

1. **soals**: Menyimpan data soal
2. **answers**: Menyimpan jawaban user dengan score
3. **users**: Data user (sudah ada sebelumnya)