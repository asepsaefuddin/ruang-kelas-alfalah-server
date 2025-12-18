# TEST FITUR AI - Step by Step

## 1. Buat Soal dengan Essay untuk Test AI

### POST /soals
```bash
curl -X POST http://localhost:3000/soals \
  -H "Content-Type: application/json" \
  -d '{
    "kode": "AI_TEST_001",
    "judul": "Test AI Grading System",
    "soal": [
      {
        "type": "pilihan ganda",
        "soal": "Apa itu fotosintesis?",
        "list_jawaban": ["a. Proses pernapasan tumbuhan", "b. Proses pembuatan makanan oleh tumbuhan", "c. Proses pertumbuhan tumbuhan", "d. Proses reproduksi tumbuhan"],
        "jawaban": "b"
      },
      {
        "type": "essay",
        "soal": "Jelaskan proses fotosintesis secara detail!",
        "jawaban": "Fotosintesis adalah proses dimana tumbuhan hijau membuat makanan sendiri menggunakan cahaya matahari, air, dan karbon dioksida. Proses ini terjadi di kloroplas dan menghasilkan glukosa serta oksigen sebagai produk sampingan."
      }
    ]
  }'
```

## 2. Ambil Soal untuk Dijawab

### GET /answer/AI_TEST_001
```bash
curl http://localhost:3000/answer/AI_TEST_001
```

## 3. Submit Jawaban untuk Test AI

### POST /answer/AI_TEST_001 - Test Jawaban Bagus
```bash
curl -X POST http://localhost:3000/answer/AI_TEST_001 \
  -H "Content-Type: application/json" \
  -d '{
    "jawaban": {
      "1": "b",
      "2": "Fotosintesis adalah proses kompleks dimana tumbuhan hijau menggunakan energi cahaya matahari untuk mengubah karbon dioksida dari udara dan air dari tanah menjadi glukosa. Proses ini terjadi di kloroplas yang mengandung klorofil, dan menghasilkan oksigen sebagai produk sampingan yang sangat penting bagi kehidupan."
    }
  }'
```

### POST /answer/AI_TEST_001 - Test Jawaban Kurang
```bash
curl -X POST http://localhost:3000/answer/AI_TEST_001 \
  -H "Content-Type: application/json" \
  -d '{
    "jawaban": {
      "1": "a",
      "2": "Fotosintesis itu tumbuhan bikin makanan pake sinar matahari."
    }
  }'
```

## 4. Test Motivasi

### GET /motivation
```bash
curl http://localhost:3000/motivation
```

## 5. Lihat Hasil Test

### GET /answer/results/AI_TEST_001
```bash
curl http://localhost:3000/answer/results/AI_TEST_001
```

---

## EXPECTED RESULTS

### Response untuk Jawaban Bagus:
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan dan dinilai",
  "data": {
    "total_score": 185,
    "max_score": 200,
    "percentage": 93,
    "correct_answers": 2,
    "overall_feedback": "Luar biasa! Pemahaman konsep sangat mendalam, pertahankan prestasi cemerlang ini!",
    "detailed_results": [
      {
        "nomor": 1,
        "type": "pilihan ganda",
        "score": 100,
        "isCorrect": true,
        "feedback": "Jawaban benar!"
      },
      {
        "nomor": 2,
        "type": "essay",
        "score": 85,
        "isCorrect": true,
        "feedback": "Penjelasan sangat lengkap dan akurat, mencakup semua aspek penting fotosintesis."
      }
    ]
  }
}
```

### Response untuk Jawaban Kurang:
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan dan dinilai",
  "data": {
    "total_score": 45,
    "max_score": 200,
    "percentage": 23,
    "correct_answers": 0,
    "overall_feedback": "Jangan menyerah! Pelajari materi lebih dalam lagi, kamu pasti bisa lebih baik!",
    "detailed_results": [
      {
        "nomor": 1,
        "type": "pilihan ganda",
        "score": 0,
        "isCorrect": false,
        "feedback": "Jawaban salah, yang benar adalah: b"
      },
      {
        "nomor": 2,
        "type": "essay",
        "score": 45,
        "isCorrect": false,
        "feedback": "Jawaban terlalu singkat, perlu penjelasan lebih detail tentang proses dan komponen fotosintesis."
      }
    ]
  }
}
```