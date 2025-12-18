# Statistics API - Dokumentasi Lengkap

## 📊 **Overview**
API Statistics menyediakan endpoint untuk analisis data lengkap termasuk statistik user, performa siswa, dan aktivitas berdasarkan tanggal.

## 🎯 **Available Endpoints**

### **1. GET /statistics**
Mendapatkan statistik keseluruhan (lengkap)

**Query Parameters:**
- `days`: number (default: 30) - Rentang hari untuk statistik aktivitas

**Request:**
```bash
GET /statistics?days=30
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik keseluruhan berhasil diambil",
  "data": {
    "userStats": {
      "totalUsers": 150,
      "totalGuru": 15,
      "totalSiswa": 130,
      "totalAdmin": 5,
      "usersByStatus": {
        "aktif": 145,
        "tidakAktif": 5
      }
    },
    "studentPerformance": {
      "totalStudents": 130,
      "studentsWithScores": 120,
      "averageScore": 78.5,
      "highestScore": 95,
      "lowestScore": 45,
      "passRate": 75,
      "performanceByClass": [
        {
          "kelas": "10A",
          "totalStudents": 25,
          "averageScore": 82.3,
          "passRate": 80
        },
        {
          "kelas": "10B",
          "totalStudents": 23,
          "averageScore": 75.8,
          "passRate": 70
        }
      ]
    },
    "activityStats": {
      "userRegistrations": [
        {
          "date": "2025-09-01",
          "count": 5,
          "role": "siswa"
        },
        {
          "date": "2025-09-01",
          "count": 2,
          "role": "guru"
        }
      ],
      "soalCreations": [
        {
          "date": "2025-09-15",
          "count": 3,
          "averageMinimalNilai": 72.5
        }
      ],
      "answerSubmissions": [
        {
          "date": "2025-09-20",
          "count": 45,
          "averageScore": 78.2,
          "passRate": 73
        }
      ]
    },
    "generatedAt": "2025-10-01T15:30:00.000Z"
  }
}
```

### **2. GET /statistics/quick**
Mendapatkan statistik ringkas/summary

**Request:**
```bash
GET /statistics/quick
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik ringkas berhasil diambil",
  "data": {
    "summary": {
      "totalUsers": 150,
      "totalGuru": 15,
      "totalSiswa": 130,
      "totalSoals": 45,
      "totalAnswers": 1250
    },
    "recentActivity": {
      "last7Days": {
        "userRegistrations": 12,
        "soalCreations": 8,
        "answerSubmissions": 156
      }
    }
  }
}
```

### **3. GET /statistics/users**
Mendapatkan statistik user (total, role, status)

**Request:**
```bash
GET /statistics/users
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik user berhasil diambil",
  "data": {
    "totalUsers": 150,
    "totalGuru": 15,
    "totalSiswa": 130,
    "totalAdmin": 5,
    "usersByStatus": {
      "aktif": 145,
      "tidakAktif": 5
    }
  }
}
```

### **4. GET /statistics/performance**
Mendapatkan statistik performa siswa

**Request:**
```bash
GET /statistics/performance
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik performa siswa berhasil diambil",
  "data": {
    "totalStudents": 130,
    "studentsWithScores": 120,
    "averageScore": 78.5,
    "highestScore": 95,
    "lowestScore": 45,
    "passRate": 75,
    "performanceByClass": [
      {
        "kelas": "10A",
        "totalStudents": 25,
        "averageScore": 82.3,
        "passRate": 80
      },
      {
        "kelas": "10B", 
        "totalStudents": 23,
        "averageScore": 75.8,
        "passRate": 70
      },
      {
        "kelas": "11IPA1",
        "totalStudents": 28,
        "averageScore": 85.2,
        "passRate": 85
      }
    ]
  }
}
```

### **5. GET /statistics/activity**
Mendapatkan statistik aktivitas berdasarkan tanggal

**Query Parameters:**
- `days`: number (default: 30) - Rentang hari untuk analisis

**Request:**
```bash
GET /statistics/activity?days=60
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik aktivitas 60 hari terakhir berhasil diambil",
  "data": {
    "userRegistrations": [
      {
        "date": "2025-09-01",
        "count": 5,
        "role": "siswa"
      },
      {
        "date": "2025-09-01",
        "count": 2,
        "role": "guru"
      },
      {
        "date": "2025-09-02",
        "count": 8,
        "role": "siswa"
      }
    ],
    "soalCreations": [
      {
        "date": "2025-09-15",
        "count": 3,
        "averageMinimalNilai": 72.5
      },
      {
        "date": "2025-09-16", 
        "count": 2,
        "averageMinimalNilai": 75.0
      }
    ],
    "answerSubmissions": [
      {
        "date": "2025-09-20",
        "count": 45,
        "averageScore": 78.2,
        "passRate": 73
      },
      {
        "date": "2025-09-21",
        "count": 38,
        "averageScore": 82.1,
        "passRate": 79
      }
    ]
  }
}
```

## 📋 **Data Structure Explanation**

### **UserStatistics**
```typescript
{
  totalUsers: number;        // Total semua user
  totalGuru: number;         // Total user role guru
  totalSiswa: number;        // Total user role siswa  
  totalAdmin: number;        // Total user role admin
  usersByStatus: {
    aktif: number;           // User dengan status aktif
    tidakAktif: number;      // User dengan status tidak aktif
  };
}
```

### **StudentPerformance**
```typescript
{
  totalStudents: number;           // Total siswa terdaftar
  studentsWithScores: number;     // Siswa yang sudah pernah ujian
  averageScore: number;           // Rata-rata nilai keseluruhan (0-100)
  highestScore: number;           // Nilai tertinggi
  lowestScore: number;            // Nilai terendah
  passRate: number;               // Persentase kelulusan (%)
  performanceByClass: [{          // Performa per kelas
    kelas: string;                // Nama kelas
    totalStudents: number;        // Total siswa di kelas
    averageScore: number;         // Rata-rata nilai kelas
    passRate: number;             // Persentase lulus kelas (%)
  }];
}
```

### **ActivityStatistics**
```typescript
{
  userRegistrations: [{           // Registrasi user per tanggal
    date: string;                 // Tanggal (YYYY-MM-DD)
    count: number;                // Jumlah registrasi
    role: string;                 // Role yang mendaftar
  }];
  soalCreations: [{               // Pembuatan soal per tanggal
    date: string;                 // Tanggal (YYYY-MM-DD)
    count: number;                // Jumlah soal dibuat
    averageMinimalNilai: number;  // Rata-rata minimal nilai soal
  }];
  answerSubmissions: [{           // Pengumpulan jawaban per tanggal
    date: string;                 // Tanggal (YYYY-MM-DD)
    count: number;                // Jumlah jawaban dikumpulkan
    averageScore: number;         // Rata-rata nilai hari itu
    passRate: number;             // Persentase lulus hari itu (%)
  }];
}
```

## 🔍 **Use Cases & Examples**

### **Dashboard Overview**
```bash
GET /statistics/quick
# Untuk menampilkan ringkasan di dashboard admin
```

### **Detail Analysis**
```bash
GET /statistics
# Untuk halaman analisis lengkap dengan grafik
```

### **User Management Insights**
```bash
GET /statistics/users
# Untuk melihat komposisi user (guru vs siswa vs admin)
```

### **Academic Performance Review**
```bash
GET /statistics/performance
# Untuk evaluasi performa akademik per kelas
```

### **Trend Analysis**
```bash
GET /statistics/activity?days=90
# Untuk melihat tren aktivitas 3 bulan terakhir
```

### **Weekly Report**
```bash
GET /statistics/activity?days=7
# Untuk laporan mingguan
```

## 📈 **Metrics Tracked**

### **User Metrics:**
✅ Total users by role (admin, guru, siswa)
✅ User status distribution (aktif vs tidak aktif)
✅ Registration trends over time

### **Academic Metrics:**
✅ Student performance averages
✅ Pass/fail rates overall and by class
✅ Score distribution (highest/lowest)
✅ Class-by-class comparison

### **Activity Metrics:**
✅ Daily user registrations by role
✅ Daily soal creation with difficulty trends
✅ Daily answer submissions with performance
✅ Customizable time range analysis

### **Operational Metrics:**
✅ Total content created (soals, answers)
✅ System usage patterns
✅ Recent activity summaries

## 🎯 **Benefits for Stakeholders**

### **For Administrators:**
- Monitor system usage and growth
- Track user engagement patterns
- Identify peak activity periods
- Make data-driven decisions

### **For Teachers:**
- Analyze student performance trends
- Compare class performance
- Identify struggling students/classes
- Optimize teaching strategies

### **For Academic Management:**
- Evaluate overall academic performance
- Track institutional metrics
- Generate reports for stakeholders
- Monitor educational quality

## 🔧 **Performance Considerations**

- **Caching**: Consider implementing caching for frequently accessed statistics
- **Aggregation**: Uses MongoDB aggregation pipeline for efficient data processing
- **Date Range**: Configurable date ranges to balance detail vs performance
- **Indexing**: Ensure proper indexing on createdAt fields for date-based queries

## 🚀 **Server Status**

✅ **All Routes Mapped Successfully:**
- `{/statistics, GET}` - Overall statistics
- `{/statistics/quick, GET}` - Quick summary
- `{/statistics/users, GET}` - User statistics
- `{/statistics/performance, GET}` - Student performance
- `{/statistics/activity, GET}` - Activity analysis

Server running on `http://localhost:3002` 🎉