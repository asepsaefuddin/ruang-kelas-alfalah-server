# Reports API - Dokumentasi Endpoint Pelaporan Nilai

## Overview
API Reports menyediakan endpoint untuk mengelola laporan nilai siswa dengan fitur CRUD lengkap dan detail jawaban.

## Endpoints

### 1. GET /reports
Mendapatkan daftar laporan nilai dengan filter dan pagination

**Query Parameters:**
- `page`: number (default: 1) - Halaman
- `limit`: number (default: 10) - Jumlah data per halaman  
- `kelas`: string (optional) - Filter berdasarkan kelas
- `status`: 'Lulus' | 'Tidak Lulus' (optional) - Filter berdasarkan status kelulusan
- `kodeSoal`: string (optional) - Filter berdasarkan kode soal

**Response:**
```json
{
  "success": true,
  "message": "Data laporan nilai berhasil diambil",
  "data": [
    {
      "_id": "6744e123abc456789def0123",
      "namaSiswa": "Ahmad Rizki",
      "kelas": "10A",
      "kodeSoal": "MATH001",
      "judulUjian": "Matematika Dasar",
      "nilai": 85,
      "tanggal": "2025-01-01T10:30:00.000Z",
      "status": "Lulus",
      "detailJawaban": [
        {
          "pertanyaan": "Berapa hasil 2 + 2?",
          "jawabanSiswa": "4",
          "jawabanBenar": "4",
          "skor": 100,
          "feedback": "Jawaban benar!"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. GET /reports/summary
Mendapatkan ringkasan statistik laporan nilai

**Response:**
```json
{
  "success": true,
  "message": "Summary laporan nilai berhasil diambil",
  "data": {
    "totalReports": 150,
    "totalLulus": 120,
    "totalTidakLulus": 30,
    "persentaseLulus": 80,
    "summaryPerKelas": [
      {
        "kelas": "10A",
        "totalSiswa": 25,
        "totalLulus": 20,
        "totalTidakLulus": 5,
        "persentaseLulus": 80,
        "rataRataNilai": 78
      },
      {
        "kelas": "10B", 
        "totalSiswa": 23,
        "totalLulus": 18,
        "totalTidakLulus": 5,
        "persentaseLulus": 78,
        "rataRataNilai": 75
      }
    ]
  }
}
```

### 3. GET /reports/:id
Mendapatkan detail laporan nilai berdasarkan ID

**Parameters:**
- `id`: string - ID laporan nilai (ObjectId dari Answer)

**Response:**
```json
{
  "success": true,
  "message": "Detail laporan nilai berhasil diambil",
  "data": {
    "_id": "6744e123abc456789def0123",
    "namaSiswa": "Ahmad Rizki",
    "kelas": "10A", 
    "kodeSoal": "MATH001",
    "judulUjian": "Matematika Dasar",
    "nilai": 85,
    "tanggal": "2025-01-01T10:30:00.000Z",
    "status": "Lulus",
    "detailJawaban": [
      {
        "pertanyaan": "Berapa hasil dari 2 + 2?",
        "jawabanSiswa": "4",
        "jawabanBenar": "4", 
        "skor": 100,
        "feedback": "Jawaban benar! Sempurna."
      },
      {
        "pertanyaan": "Berapa hasil dari 5 x 3?",
        "jawabanSiswa": "15",
        "jawabanBenar": "15",
        "skor": 100,
        "feedback": "Jawaban benar!"
      },
      {
        "pertanyaan": "Jelaskan teorema Pythagoras",
        "jawabanSiswa": "Teorema yang menyatakan bahwa...",
        "jawabanBenar": null,
        "skor": 70,
        "feedback": "Penjelasan cukup baik namun kurang detail pada beberapa bagian."
      }
    ]
  }
}
```

### 4. DELETE /reports/:id
Menghapus laporan nilai berdasarkan ID

**Parameters:**
- `id`: string - ID laporan nilai (ObjectId dari Answer)

**Response Success:**
```json
{
  "success": true,
  "message": "Laporan nilai berhasil dihapus"
}
```

**Response Error (Not Found):**
```json
{
  "success": false,
  "message": "Gagal menghapus laporan nilai",
  "error": "Report tidak ditemukan"
}
```

## Data Structure

### ReportData Interface
```typescript
interface ReportData {
  _id: string;
  namaSiswa: string;
  kelas: string;
  kodeSoal: string;
  judulUjian: string;
  nilai: number; // Persentase 0-100
  tanggal: Date;
  status: 'Lulus' | 'Tidak Lulus';
  detailJawaban: {
    pertanyaan: string;
    jawabanSiswa: string;
    jawabanBenar?: string; // null untuk soal esai
    skor: number; // 0-100 per soal
    feedback?: string; // Dari AI grading
  }[];
}
```

## Contoh Penggunaan

### 1. Mendapatkan Semua Laporan
```bash
GET /reports?page=1&limit=20
```

### 2. Filter Berdasarkan Kelas
```bash
GET /reports?kelas=10A&page=1&limit=10
```

### 3. Filter Hanya Yang Lulus
```bash
GET /reports?status=Lulus&page=1&limit=10
```

### 4. Filter Berdasarkan Kode Soal
```bash
GET /reports?kodeSoal=MATH001&page=1&limit=10
```

### 5. Kombinasi Filter
```bash
GET /reports?kelas=10A&status=Tidak%20Lulus&page=1&limit=5
```

### 6. Mendapatkan Detail Laporan
```bash
GET /reports/6744e123abc456789def0123
```

### 7. Menghapus Laporan
```bash
DELETE /reports/6744e123abc456789def0123
```

### 8. Mendapatkan Summary
```bash
GET /reports/summary
```

## Features

### ✅ **Yang Sudah Diimplementasikan:**
1. **Daftar Laporan dengan Filter**
   - Pagination (page, limit)
   - Filter berdasarkan kelas
   - Filter berdasarkan status kelulusan
   - Filter berdasarkan kode soal
   - Kombinasi multiple filters

2. **Detail Laporan Lengkap**
   - Informasi siswa (nama, kelas)
   - Informasi ujian (kode, judul)
   - Nilai dan status kelulusan
   - Tanggal pengerjaan
   - Detail jawaban per soal dengan feedback AI

3. **Summary Statistik**
   - Total laporan
   - Jumlah lulus/tidak lulus
   - Persentase kelulusan keseluruhan
   - Breakdown per kelas dengan statistik masing-masing

4. **CRUD Operations**
   - ✅ Read (GET) - List dan detail
   - ✅ Delete (DELETE) - Hapus laporan
   - ❌ Create - Tidak diperlukan (otomatis dari submit jawaban)
   - ❌ Update - Tidak diperlukan (nilai final)

### 📊 **Data Yang Ditampilkan:**
- **Informasi Siswa**: Nama lengkap, kelas
- **Informasi Ujian**: Kode soal, judul ujian
- **Penilaian**: Nilai persentase (0-100), status lulus/tidak lulus
- **Waktu**: Tanggal pengerjaan (otomatis menggunakan new Date())
- **Detail Jawaban**: 
  - Pertanyaan yang diajukan
  - Jawaban yang diberikan siswa
  - Jawaban benar (untuk pilihan ganda/isian)
  - Skor per soal (0-100)
  - Feedback dari AI grading

## Error Handling

Semua endpoint memiliki error handling yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang user-friendly",
  "error": "Detail error teknis"
}
```

**HTTP Status Codes:**
- `200`: Success
- `404`: Data tidak ditemukan
- `500`: Internal server error

## Integration

Reports module terintegrasi penuh dengan:
- **Answer Schema**: Menggunakan data jawaban yang sudah ada
- **User Schema**: Mendapatkan info siswa (nama, kelas)
- **Soal Schema**: Mendapatkan info soal (judul, pertanyaan)
- **AI Grading**: Menampilkan feedback dari Gemini AI

## Database Relations

Reports tidak memiliki collection sendiri, melainkan menggunakan aggregation dari:
- **answers collection** (primary data)
- **users collection** (populate user info)
- **soals collection** (populate soal info)

Ini memastikan konsistensi data dan tidak ada duplikasi informasi.