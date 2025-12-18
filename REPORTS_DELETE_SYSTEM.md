# Reports Delete System - Safe User-Specific Deletion

## 🛡️ **Improved Delete Functionality**

### **Sebelum (Berbahaya):**
```bash
DELETE /reports/{id}
# Menghapus answer berdasarkan ID saja tanpa informasi user
```

### **Sekarang (Aman & Informatif):**
```bash
# 1. Delete specific answer (by report ID) - with user info
DELETE /reports/{id}
# Response: Informasi lengkap user & soal yang dihapus

# 2. Delete all answers from specific user for specific soal
DELETE /reports/user/{userId}/soal/{soalKode}
# Response: Berapa answer yang dihapus + detail user & soal
```

## 📋 **Available Delete Endpoints**

### **1. DELETE /reports/:id**
Menghapus 1 answer specific berdasarkan report ID

#### **Request:**
```bash
DELETE /reports/68dd360a061e7e96e2238d5d
```

#### **Response:**
```json
{
  "success": true,
  "message": "Laporan nilai berhasil dihapus",
  "data": {
    "deleted_answer_id": "68dd360a061e7e96e2238d5d",
    "user_info": {
      "user_id": "67757a06eb8c78b75c7e11b9",
      "username": "ahmad_rizki",
      "namaLengkap": "Ahmad Rizki Pratama"
    },
    "soal_info": {
      "soal_id": "67757b12eb8c78b75c7e11bb",
      "kode": "MATH001",
      "judul": "Matematika Dasar"
    },
    "note": "Hanya menghapus 1 answer record specific ini, tidak menghapus answer lain dari user yang sama"
  }
}
```

### **2. DELETE /reports/user/:userId/soal/:soalKode**
Menghapus SEMUA answer dari user tertentu untuk soal tertentu

#### **Request:**
```bash
DELETE /reports/user/67757a06eb8c78b75c7e11b9/soal/MATH001
```

#### **Response:**
```json
{
  "success": true,
  "message": "Semua laporan nilai user untuk soal tersebut berhasil dihapus",
  "data": {
    "deleted_count": 3,
    "user_info": {
      "user_id": "67757a06eb8c78b75c7e11b9",
      "username": "ahmad_rizki",
      "namaLengkap": "Ahmad Rizki Pratama"
    },
    "soal_kode": "MATH001",
    "deleted_answer_ids": [
      "68dd360a061e7e96e2238d5d",
      "68dd361b061e7e96e2238d5e",
      "68dd362c061e7e96e2238d5f"
    ],
    "note": "Menghapus semua 3 answer dari user 67757a06eb8c78b75c7e11b9 untuk soal MATH001"
  }
}
```

## 🔒 **Safety Features**

### **1. User Information Verification**
Sebelum delete, sistem:
- ✅ Fetch user info untuk konfirmasi
- ✅ Fetch soal info untuk konfirmasi  
- ✅ Return detailed info tentang apa yang dihapus

### **2. Scope-Limited Deletion**
```bash
# AMAN: Hanya hapus 1 answer specific
DELETE /reports/{answer_id}

# AMAN: Hanya hapus answer user X untuk soal Y
DELETE /reports/user/{userId}/soal/{soalKode}

# TIDAK ADA: Delete all answers (berbahaya)
```

### **3. Detailed Response**
Setiap delete operation memberikan info:
- ID yang dihapus
- User yang terkait
- Soal yang terkait
- Jumlah record yang dihapus
- Note penjelasan

## 🧪 **Testing Scenarios**

### **Scenario 1: Delete Single Report**

```bash
# Step 1: Get report ID
GET /reports?page=1&limit=5
# Catat report._id untuk testing

# Step 2: Delete specific report
DELETE /reports/{report_id}

# Step 3: Verify deletion
GET /reports/{report_id}
# Expected: 404 Not Found

# Step 4: Check other reports masih ada
GET /reports
# Expected: Reports lain tidak terhapus
```

### **Scenario 2: Delete All User's Answers for Specific Soal**

```bash
# Step 1: Check existing answers
GET /reports?page=1&limit=10
# Catat user_id dan soal_kode

# Step 2: Delete all user answers for specific soal
DELETE /reports/user/{user_id}/soal/{soal_kode}

# Step 3: Verify deletion
GET /reports?page=1&limit=10
# Expected: Semua answer user tersebut untuk soal tersebut hilang

# Step 4: Check answers for other soals masih ada
GET /reports
# Expected: Answer user untuk soal lain masih ada
```

### **Scenario 3: Error Handling**

```bash
# Test 1: Invalid report ID
DELETE /reports/invalid-id
# Expected: 404 "Report tidak ditemukan"

# Test 2: Invalid user ID
DELETE /reports/user/invalid-user-id/soal/MATH001
# Expected: 404 "Tidak ada answer yang ditemukan"

# Test 3: Invalid soal kode
DELETE /reports/user/{valid_user_id}/soal/INVALID_SOAL
# Expected: 404 "Tidak ada answer yang ditemukan"
```

## ⚠️ **Important Notes**

### **1. Data Safety**
- ✅ **Specific Deletion**: Hanya hapus data yang diminta
- ✅ **User Context**: Selalu dengan informasi user yang jelas
- ✅ **Audit Trail**: Response detail untuk tracking
- ❌ **No Bulk Delete**: Tidak ada delete all tanpa filter

### **2. Use Cases**

#### **Delete Single Report (ID-based):**
```bash
# Use case: Hapus 1 submission yang salah/corrupt
DELETE /reports/{answer_id}
```

#### **Delete User's All Attempts (User+Soal):**
```bash
# Use case: User mengulang ujian, hapus attempt sebelumnya
DELETE /reports/user/{user_id}/soal/{soal_kode}
```

### **3. Alternative Approaches**

Jika ingin delete berdasarkan user saja (semua soal):
```bash
# Tidak tersedia karena terlalu berbahaya
# Gunakan multiple calls:
DELETE /reports/user/{user_id}/soal/MATH001
DELETE /reports/user/{user_id}/soal/SCIENCE001
# dst.
```

## 📊 **Comparison: Before vs After**

### **Before (Dangerous):**
```bash
DELETE /reports/{id}
# Response: "Laporan nilai berhasil dihapus"
# Problem: Tidak tahu user mana, soal apa yang dihapus
```

### **After (Safe & Informative):**
```bash
DELETE /reports/{id}
# Response: Full details including:
# - User info (username, namaLengkap)
# - Soal info (kode, judul)  
# - What exactly was deleted
# - Safety note about scope

DELETE /reports/user/{userId}/soal/{soalKode}
# Response: Batch deletion with:
# - Count of deleted records
# - List of deleted IDs
# - User & soal verification
# - Clear scope explanation
```

## 🚀 **Ready to Use**

Server sudah running dengan endpoint:
- ✅ `DELETE /reports/:id` - Enhanced with user info
- ✅ `DELETE /reports/user/:userId/soal/:soalKode` - New batch delete

Sekarang delete operation lebih aman dan informatif! 🎉

## 🔍 **Quick Test Commands**

```bash
# Test single delete
DELETE /reports/68dd360a061e7e96e2238d5d

# Test user+soal delete
DELETE /reports/user/67757a06eb8c78b75c7e11b9/soal/MATH001

# Verify with list
GET /reports
```