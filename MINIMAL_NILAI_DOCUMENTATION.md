# Fitur Minimal Nilai - Dokumentasi

## Overview
Fitur minimal nilai telah berhasil diimplementasikan untuk menentukan status kelulusan siswa berdasarkan skor minimum yang ditetapkan pada setiap soal.

## Perubahan Schema

### 1. Soal Schema (`src/soals/schemas/soal.schema.ts`)
**Field Baru:**
- `minimalNilai`: Number (0-100) - Nilai minimum untuk lulus
  - Required: true
  - Minimum: 0
  - Maximum: 100
  - Default: 70

### 2. Answer Schema (`src/answers/schemas/answer.schema.ts`)
**Field Baru:**
- `percentage`: Number - Persentase nilai (0-100)
- `minimalNilai`: Number - Nilai minimum dari soal terkait
- `isLulus`: Boolean - Status kelulusan (true/false)

## API Endpoints Baru

### 1. GET /answer/summary
Mendapatkan ringkasan statistik semua jawaban

**Response:**
```json
{
  "success": true,
  "message": "Summary data jawaban berhasil diambil",
  "data": {
    "total_answers": 50,
    "lulus": 35,
    "tidak_lulus": 15,
    "persentase_kelulusan": 70,
    "rata_rata_nilai": 78
  }
}
```

### 2. GET /answer/results/all?isLulus=true/false
Mendapatkan semua jawaban dengan filter status kelulusan

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `isLulus`: boolean (optional) - true untuk yang lulus, false untuk tidak lulus

**Response:**
```json
{
  "success": true,
  "message": "Data jawaban berhasil diambil",
  "data": [...],
  "count": 10,
  "total": 50,
  "page": 1,
  "limit": 10,
  "summary": {
    "total_answers": 50,
    "lulus": 35,
    "tidak_lulus": 15,
    "persentase_kelulusan": 70,
    "rata_rata_nilai": 78
  }
}
```

## Logika Penilaian

### 1. Perhitungan Skor
- **Total Skor Maksimal**: Jumlah soal × 100
- **Persentase**: (Total Skor / Skor Maksimal) × 100
- **Status Lulus**: Persentase ≥ Minimal Nilai

### 2. Contoh Perhitungan
```
Soal: 5 pertanyaan
Minimal Nilai: 70%
Skor yang didapat: 350 dari 500 maksimal
Persentase: (350/500) × 100 = 70%
Status: LULUS (karena 70% ≥ 70%)
```

### 3. Response Submit Jawaban
Ketika siswa submit jawaban, response akan include:
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan dan dinilai",
  "data": {
    "answer_id": "...",
    "kode_soal": "MATH001",
    "total_score": 350,
    "max_score": 500,
    "percentage": 70,
    "minimal_nilai": 70,
    "is_lulus": true,
    "status": "graded",
    "feedback": "Nilai Anda 70%. Selamat, Anda LULUS!",
    "detailed_results": [...]
  }
}
```

## Validasi Data

### 1. CreateSoalDto
- `minimalNilai` field ditambahkan dengan validasi:
  - `@IsNumber()`
  - `@Min(0)`
  - `@Max(100)`
  - `@IsNotEmpty()`

### 2. Database Validation
- Schema validation memastikan minimalNilai selalu dalam range 0-100
- Default value 70 jika tidak disediakan

## Testing

### 1. Test Scenario Lulus
```bash
# Buat soal dengan minimal nilai 70
POST /soals
{
  "kode": "TEST001",
  "judulSoal": "Test Soal",
  "minimalNilai": 70,
  "soal": [...] 
}

# Submit jawaban dengan skor ≥ 70%
POST /answer/TEST001
{
  "user_id": "...",
  "jawaban": [...] // jawaban yang akan menghasilkan ≥ 70%
}
```

### 2. Test Scenario Tidak Lulus
```bash
# Submit jawaban dengan skor < 70%
POST /answer/TEST001
{
  "user_id": "...",
  "jawaban": [...] // jawaban yang akan menghasilkan < 70%
}
```

### 3. Test Filter dan Summary
```bash
# Get summary
GET /answer/summary

# Get hanya yang lulus
GET /answer/results/all?isLulus=true

# Get hanya yang tidak lulus  
GET /answer/results/all?isLulus=false
```

## Status Implementasi

✅ **Completed:**
- Schema updates (Soal dan Answer)
- Logika perhitungan persentase dan status lulus
- API endpoints untuk summary dan filtering
- Validasi data dan error handling
- Integration dengan AI grading system

✅ **Tested:**
- Server startup berhasil
- Route mapping terkonfirmasi
- Schema validation berfungsi

## Catatan Teknis

1. **Backward Compatibility**: Field `minimalNilai` memiliki default value 70, sehingga soal existing akan tetap berfungsi.

2. **AI Integration**: Sistem tetap menggunakan AI grading, namun status kelulusan ditentukan oleh persentase skor terhadap minimal nilai.

3. **Performance**: Summary endpoint menggunakan aggregation untuk efisiensi query database.

4. **Error Handling**: Semua endpoint memiliki proper error handling dan response format yang konsisten.

## Contoh Penggunaan

### Membuat Soal dengan Minimal Nilai
```javascript
const soal = {
  kode: "MATH001",
  judulSoal: "Matematika Dasar",
  minimalNilai: 75, // 75% untuk lulus
  soal: [
    {
      pertanyaan: "Berapa 2 + 2?",
      jenis_soal: "pilihan_ganda",
      pilihan: ["3", "4", "5", "6"],
      jawaban_benar: "4"
    }
  ]
};
```

### Monitoring Hasil dengan Summary
```javascript
// Untuk mendapatkan statistik keseluruhan
fetch('/answer/summary')
  .then(response => response.json())
  .then(data => {
    console.log(`Tingkat kelulusan: ${data.data.persentase_kelulusan}%`);
    console.log(`Rata-rata nilai: ${data.data.rata_rata_nilai}`);
  });
```