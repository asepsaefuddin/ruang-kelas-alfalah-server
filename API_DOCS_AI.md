# API Documentation - Fitur AI (Gemini) untuk Soal dan Motivasi

## Base URL
```
http://localhost:3000
```

## 🤖 AI FEATURES

### 1. **Auto Essay Grading dengan AI**
Ketika submit jawaban yang berisi essay, sistem akan otomatis menilai menggunakan Gemini AI.

### 2. **Feedback Intelligent**
AI memberikan feedback konstruktif untuk setiap jawaban essay dan feedback keseluruhan.

### 3. **Motivational Quotes**
Endpoint untuk mendapatkan kata-kata motivasi dari AI.

---

## 📝 ENHANCED ANSWER ENDPOINTS

### POST /answer/:kode - Submit Jawaban (Enhanced dengan AI)

**Request:**
```http
POST /answer/MATH001
Content-Type: application/json

{
  "jawaban": {
    "1": "b",              // Pilihan ganda 
    "2": "a",              // Pilihan ganda
    "3": "Matematika dasar adalah ilmu yang mempelajari angka, operasi aritmatika seperti penjumlahan, pengurangan, perkalian, dan pembagian. Konsep ini menjadi fondasi untuk matematika yang lebih kompleks."  // Essay
  },
  "user_id": "674dd14ad967cab43b7af5c4c"
}
```

**Enhanced Response dengan AI:**
```json
{
  "success": true,
  "message": "Jawaban berhasil disimpan dan dinilai",
  "data": {
    "answer_id": "674dd14ad967cab43b7af5c4d",
    "kode_soal": "MATH001",
    "total_score": 285,
    "max_score": 300,
    "percentage": 95,
    "correct_answers": 3,
    "total_questions": 3,
    "status": "graded",
    "overall_feedback": "Luar biasa! Pemahaman materi sangat baik, pertahankan semangat belajarmu!",
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
        "type": "pilihan ganda", 
        "score": 100,
        "isCorrect": true,
        "feedback": "Jawaban benar!"
      },
      {
        "nomor": 3,
        "type": "essay",
        "score": 85,
        "isCorrect": true,
        "feedback": "Penjelasan sangat baik dan lengkap, mencakup semua aspek dasar matematika dengan jelas."
      }
    ],
    "jawaban": {
      "1": "b",
      "2": "a",
      "3": "Matematika dasar adalah..."
    }
  }
}
```

---

## 🎯 MOTIVATION ENDPOINT

### GET /motivation - Kata Motivasi dari AI

**Request:**
```http
GET /motivation
```

**Response:**
```json
{
  "success": true,
  "message": "Kata motivasi berhasil diambil",
  "data": {
    "motivation": "Terus belajar dan pantang menyerah, kesuksesan menanti di depan!",
    "timestamp": "2025-01-10T10:30:00.000Z"
  }
}
```

---

## 🧠 AI SCORING SYSTEM

### **Pilihan Ganda:**
- ✅ **Benar**: 100 point
- ❌ **Salah**: 0 point
- 📊 **Feedback**: Jawaban benar/salah + jawaban yang tepat

### **Essay (AI Graded):**
- 🎯 **Score Range**: 0-100 point berdasarkan AI analysis
- 📝 **Criteria**:
  - Kesesuaian dengan jawaban benar (40%)
  - Kelengkapan informasi (30%)
  - Kejelasan penjelasan (20%)
  - Tata bahasa dan struktur (10%)
- 💬 **Feedback**: Saran konstruktif dan motivasi dari AI
- ✅ **Threshold**: Score ≥ 70 dianggap benar

### **Overall Feedback:**
- 🤖 **AI Generated**: Feedback keseluruhan berdasarkan performa
- 🎯 **Personalized**: Sesuai dengan tingkat pencapaian
- 💪 **Motivational**: Mendorong semangat belajar

---

## 📊 SCORING EXAMPLES

### **Scenario 1: Perfect Score**
```json
{
  "total_score": 300,
  "max_score": 300,
  "percentage": 100,
  "overall_feedback": "Sempurna! Pemahaman materi luar biasa, kamu sudah menguasai semua konsep!"
}
```

### **Scenario 2: Good Score**
```json
{
  "total_score": 220,
  "max_score": 300,
  "percentage": 73,
  "overall_feedback": "Bagus sekali! Sedikit lagi untuk sempurna, terus tingkatkan lagi!"
}
```

### **Scenario 3: Need Improvement**
```json
{
  "total_score": 120,
  "max_score": 300,
  "percentage": 40,
  "overall_feedback": "Jangan menyerah! Belajar lebih giat lagi, kamu pasti bisa lebih baik!"
}
```

---

## 🔧 TESTING

### **Test Essay Grading:**
```bash
curl -X POST http://localhost:3000/answer/TEST001 \
  -H "Content-Type: application/json" \
  -d '{
    "jawaban": {
      "1": "a",
      "2": "Fotosintesis adalah proses dimana tumbuhan membuat makanan sendiri menggunakan cahaya matahari, air, dan karbon dioksida untuk menghasilkan glukosa dan oksigen."
    }
  }'
```

### **Test Motivation:**
```bash
curl http://localhost:3000/motivation
```

---

## 🚀 NEW FEATURES SUMMARY

1. ✅ **AI Essay Grading** - Otomatis menilai essay dengan Gemini AI
2. ✅ **Intelligent Feedback** - Feedback konstruktif per soal dan keseluruhan
3. ✅ **Motivational Quotes** - Endpoint kata motivasi dari AI
4. ✅ **Enhanced Scoring** - Score 0-100 untuk semua jenis soal
5. ✅ **Real-time Processing** - Langsung dinilai saat submit jawaban
6. ✅ **Detailed Results** - Breakdown per soal dengan feedback individual

## 🎯 **Status Penilaian:**
- **"graded"**: Semua jawaban sudah dinilai (termasuk essay oleh AI)
- **"pending"**: Tidak digunakan lagi (semua langsung dinilai AI)