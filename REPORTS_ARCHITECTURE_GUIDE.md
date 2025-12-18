# Reports System - Architecture & ID Mapping

## 🏗️ **Architecture Overview**

### **Reports TIDAK memiliki collection sendiri!** ❌
Reports adalah **virtual entity** yang dibuat dari aggregation 3 collection:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ANSWERS   │    │    USERS    │    │    SOALS    │
│  (primary)  │    │ (populate)  │    │ (populate)  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ _id         │    │ _id         │    │ _id         │
│ user_id  ──────→ │ username    │    │ kode        │
│ soal_id  ──────────────────────────→ │ judul       │
│ kode_soal   │    │ namaLengkap │    │ soal[]      │
│ jawaban     │    │ kelas       │    │ minimalNilai│
│ percentage  │    │ role        │    └─────────────┘
│ isLulus     │    └─────────────┘
│ detailed_   │
│ results     │
└─────────────┘
```

### **Report ID = Answer ID** 🔑
```typescript
// Di Reports API:
report._id = answer._id  // Report ID sama dengan Answer ID
```

## 📊 **Data Flow & ID Mapping**

### 1. **Cara Mendapatkan Report ID**

#### From Answer Submission:
```bash
# 1. Submit jawaban
POST /answer/MATH001
{
  "user_id": "67757a06eb8c78b75c7e11b9",
  "jawaban": {"1": "a", "2": "essay answer"}
}

# Response:
{
  "success": true,
  "data": {
    "answer_id": "68dd360a061e7e96e2238d5d",  # ← INI REPORT ID
    "kode_soal": "MATH001",
    "total_score": 85,
    "is_lulus": true
  }
}
```

#### From Reports List:
```bash
# 2. Get reports list
GET /reports?page=1&limit=10

# Response:
{
  "data": [
    {
      "_id": "68dd360a061e7e96e2238d5d",  # ← REPORT ID (sama dengan Answer ID)
      "namaSiswa": "Ahmad Rizki",
      "kelas": "10A",
      "kodeSoal": "MATH001",
      "judulUjian": "Matematika Dasar",
      "nilai": 85,
      "status": "Lulus"
    }
  ]
}
```

### 2. **Menggunakan Report ID untuk Detail**

```bash
# 3. Get detail report menggunakan ID dari step 1 atau 2
GET /reports/68dd360a061e7e96e2238d5d

# Response: Detail lengkap dengan semua jawaban
{
  "success": true,
  "data": {
    "_id": "68dd360a061e7e96e2238d5d",
    "namaSiswa": "Ahmad Rizki",
    "kelas": "10A", 
    "detailJawaban": [...]
  }
}
```

### 3. **Delete Report**

```bash
# 4. Delete report (akan menghapus Answer dari database)
DELETE /reports/68dd360a061e7e96e2238d5d

# ⚠️ WARNING: Ini akan PERMANENT menghapus data Answer!
```

## 🔍 **Verification & Testing**

### **Test 1: Verify ID Consistency**

```bash
# Step 1: Submit answer dan catat answer_id
POST /answer/TEST001
{
  "user_id": "67757a06eb8c78b75c7e11b9",
  "jawaban": {"1": "a"}
}
# Response: { "answer_id": "XXXXX" }

# Step 2: Check reports list
GET /reports?kodeSoal=TEST001
# Verify: reports._id should match answer_id dari step 1

# Step 3: Get detail report
GET /reports/XXXXX
# Should return detail report

# Step 4: Verify in database directly
# MongoDB query: db.answers.findOne({_id: ObjectId("XXXXX")})
```

### **Test 2: Check Database Collections**

```bash
# 1. Check collections exist
GET /health  # Server should show connected collections

# 2. Verify no 'reports' collection
# MongoDB: show collections
# Should show: users, soals, answers (NO reports collection)
```

## 💾 **Database Queries Behind the Scenes**

### **GET /reports (List)**
```javascript
// Actual MongoDB aggregation pipeline:
[
  // 1. Filter answers
  { $match: { /* filter by status, kodeSoal, etc */ } },
  
  // 2. Join with users
  {
    $lookup: {
      from: 'users',
      localField: 'user_id', 
      foreignField: '_id',
      as: 'user'
    }
  },
  
  // 3. Join with soals
  {
    $lookup: {
      from: 'soals',
      localField: 'soal_id',
      foreignField: '_id', 
      as: 'soal'
    }
  },
  
  // 4. Transform data
  {
    $project: {
      _id: 1,  // Answer._id becomes Report._id
      namaSiswa: '$user.namaLengkap',
      kelas: '$user.kelas',
      kodeSoal: '$kode_soal',
      judulUjian: '$soal.judul',
      nilai: '$percentage',
      status: { $cond: ['$isLulus', 'Lulus', 'Tidak Lulus'] }
    }
  }
]
```

### **GET /reports/:id (Detail)**
```javascript
// MongoDB query:
Answer.findById(id)
  .populate('user_id')  // Get user data
  .populate('soal_id')  // Get soal data
  .exec()
```

### **DELETE /reports/:id**
```javascript
// MongoDB query:
Answer.findByIdAndDelete(id)  // Permanently delete Answer
```

## ⚠️ **Important Notes**

### **1. Data Integrity**
- **Report ID = Answer ID** (1:1 mapping)
- Deleting report = deleting answer permanently
- No separate reports collection = no data duplication

### **2. Performance Considerations**
- Reports query uses aggregation (slower than simple find)
- Pagination recommended for large datasets
- Indexes on user_id, soal_id, kode_soal recommended

### **3. Error Scenarios**
```bash
# Report not found (Answer doesn't exist)
GET /reports/invalid-id
# Response: 404 "Report tidak ditemukan"

# User deleted but Answer exists  
# Result: "namaSiswa": "Unknown", "kelas": "Unknown"

# Soal deleted but Answer exists
# Result: "judulUjian": "Unknown"
```

## 🔧 **Debug Commands**

### **1. Check if Answer exists for Report ID**
```bash
# Direct Answer query
GET /answer/results/all
# Find the specific answer_id in the list
```

### **2. Verify User/Soal Population**
```javascript
// In MongoDB shell:
db.answers.findOne(
  {_id: ObjectId("REPORT_ID")},
  {user_id: 1, soal_id: 1, kode_soal: 1}
)

// Check if user exists:
db.users.findOne({_id: ObjectId("USER_ID_FROM_ABOVE")})

// Check if soal exists:
db.soals.findOne({_id: ObjectId("SOAL_ID_FROM_ABOVE")})
```

### **3. Test Complete Flow**
```bash
# 1. Create user
POST /users { "username": "test", "namaLengkap": "Test User", "role": "siswa", "kelas": "10A" }

# 2. Create soal  
POST /soals { "kode": "TEST", "judul": "Test Soal", "soal": [...] }

# 3. Submit answer
POST /answer/TEST { "user_id": "USER_ID", "jawaban": {...} }

# 4. Get reports (should show the data)
GET /reports

# 5. Get specific report
GET /reports/ANSWER_ID_FROM_STEP_3
```

## 📋 **Summary**

✅ **Reports = Virtual Entity** (no separate collection)
✅ **Report ID = Answer ID** (direct mapping)  
✅ **Data comes from**: answers + users + soals (aggregation)
✅ **CRUD Operations**: Read + Delete only (Create via answer submission)
✅ **Testing**: Follow the flow above to verify functionality