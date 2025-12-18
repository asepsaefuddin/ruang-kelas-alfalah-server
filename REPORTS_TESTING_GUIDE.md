# Testing Guide - Reports API & ID Verification

## 🧪 **Complete Testing Flow**

### **Step 1: Verify Collections & Data**

```bash
# 1. Check server health
GET /health

# 2. Check available users
GET /users

# 3. Check available soals
GET /soals

# 4. Check existing answers
GET /answer/results/all
```

### **Step 2: Create Test Data (if needed)**

```bash
# 1. Create test user
POST /users
{
  "username": "test_student",
  "namaLengkap": "Test Student Name",
  "nipNim": "12345678",
  "role": "siswa",
  "kelas": "10A"
}
# Response: Save user._id untuk testing

# 2. Create test soal
POST /soals
{
  "kode": "TEST001",
  "judul": "Test Soal untuk Reports",
  "minimalNilai": 70,
  "soal": [
    {
      "type": "pilihan_ganda",
      "soal": "Berapa 2 + 2?",
      "pilihan": ["3", "4", "5", "6"],
      "jawaban_benar": "4"
    },
    {
      "type": "essay",
      "soal": "Jelaskan proses fotosintesis!"
    }
  ]
}

# 3. Submit answer
POST /answer/TEST001
{
  "user_id": "USER_ID_FROM_STEP_1",
  "jawaban": {
    "1": "4",
    "2": "Fotosintesis adalah proses..."
  }
}
# Response: Catat answer_id untuk testing reports
```

### **Step 3: Test Reports API**

```bash
# 1. Get all reports
GET /reports
# Verify: Should show test data dengan nama, kelas, dan jawaban benar

# 2. Get specific report menggunakan answer_id dari step 2
GET /reports/{ANSWER_ID_FROM_STEP_2}
# Verify: Should return detailed report

# 3. Test filter by class
GET /reports?kelas=10A

# 4. Test filter by status
GET /reports?status=Lulus

# 5. Test filter by kodeSoal
GET /reports?kodeSoal=TEST001
```

### **Step 4: Verify ID Mapping**

```bash
# 1. Debug: Verify answer exists and get details
GET /reports/debug/verify/{ANSWER_ID}

# Expected Response:
{
  "success": true,
  "message": "Verifikasi answer/report berhasil",
  "data": {
    "answer_id": "68dd360a061e7e96e2238d5d",
    "report_id": "68dd360a061e7e96e2238d5d",  # Same as answer_id!
    "answer_exists": true,
    "user_data": {
      "exists": true,
      "username": "test_student",
      "namaLengkap": "Test Student Name",
      "kelas": "10A"
    },
    "soal_data": {
      "exists": true,
      "kode": "TEST001",
      "judul": "Test Soal untuk Reports"
    },
    "collections_used": {
      "primary": "answers",
      "populated": ["users", "soals"],
      "reports_collection": "NOT EXISTS - Virtual entity"  # Key proof!
    }
  }
}

# 2. Debug: Get report directly from answer ID
GET /reports/debug/answer-to-report/{ANSWER_ID}

# Expected Response:
{
  "success": true,
  "message": "Report berhasil diambil dari Answer ID",
  "data": { /* complete report data */ },
  "note": "Report ID sama dengan Answer ID - ini membuktikan bahwa reports tidak punya collection sendiri"
}
```

### **Step 5: Test Edge Cases**

```bash
# 1. Test dengan invalid ID
GET /reports/invalid-object-id
# Expected: 404 error

# 2. Test dengan answer yang user-nya dihapus
# - Delete user dari step 1
DELETE /users/{USER_ID}
# - Coba get report lagi
GET /reports/{ANSWER_ID}
# Expected: "namaSiswa": "Unknown", "kelas": "Unknown"

# 3. Test dengan answer yang soal-nya dihapus
# - Delete soal dari step 2
DELETE /soals/{SOAL_ID}
# - Coba get report lagi
GET /reports/{ANSWER_ID}
# Expected: "judulUjian": "Unknown"
```

## 🔍 **Key Verification Points**

### ✅ **Reports = Virtual Entity**
```bash
# Proof 1: Same ID
# answer_id dari POST /answer/{kode} = report_id dari GET /reports

# Proof 2: Debug endpoint shows collections used
GET /reports/debug/verify/{ANSWER_ID}
# Shows: "reports_collection": "NOT EXISTS - Virtual entity"

# Proof 3: Delete report = delete answer
DELETE /reports/{REPORT_ID}
# Akan menghapus data dari collection 'answers', bukan 'reports'
```

### ✅ **ID Mapping Consistency**
```javascript
// Test script untuk verifikasi ID:
const answerResponse = await fetch('/answer/TEST001', { 
  method: 'POST', 
  body: JSON.stringify({...}) 
});
const answerId = answerResponse.data.answer_id;

const reportResponse = await fetch(`/reports/${answerId}`);
const reportId = reportResponse.data._id;

console.log(answerId === reportId); // Should be TRUE
```

### ✅ **Data Population Working**
```bash
# Before fix: "namaSiswa": "Unknown"
# After fix: "namaSiswa": "Test Student Name"

# Before fix: "jawabanBenar": null (for all)
# After fix: "jawabanBenar": "4" (for pilihan ganda), null (for essay)
```

## 📊 **Testing Checklist**

### **Basic Functionality** ✅
- [ ] GET /reports returns list with pagination
- [ ] GET /reports/:id returns specific report detail
- [ ] DELETE /reports/:id deletes answer record
- [ ] GET /reports/summary returns statistics

### **ID Verification** ✅
- [ ] Report ID = Answer ID (same value)
- [ ] Debug endpoints confirm virtual entity
- [ ] Delete report removes answer from database

### **Data Integrity** ✅
- [ ] User data populated correctly (namaLengkap, kelas)
- [ ] Soal data populated correctly (judul, pertanyaan)
- [ ] Jawaban benar shown for pilihan ganda/isian
- [ ] Jawaban benar null for essay (correct behavior)

### **Filtering** ✅
- [ ] Filter by kelas works
- [ ] Filter by status (Lulus/Tidak Lulus) works
- [ ] Filter by kodeSoal works
- [ ] Combination filters work
- [ ] Pagination works

### **Error Handling** ✅
- [ ] Invalid ID returns 404
- [ ] Missing user shows "Unknown"
- [ ] Missing soal shows "Unknown"
- [ ] Database errors handled gracefully

## 🚀 **Quick Test Commands**

```bash
# Complete flow test:
# 1. Create data
POST /users {...}          # Get user_id
POST /soals {...}          # Create test soal
POST /answer/TEST001 {...} # Get answer_id

# 2. Verify reports
GET /reports                              # Should show new data
GET /reports/{answer_id}                  # Should return details
GET /reports/debug/verify/{answer_id}     # Should confirm ID mapping

# 3. Clean up
DELETE /reports/{answer_id}               # Should delete answer record
```

## 💡 **Pro Tips**

1. **ID Tracing**: Always save answer_id from answer submission untuk testing reports
2. **Data Dependencies**: Reports bergantung pada users & soals - pastikan data lengkap
3. **Virtual Entity**: Reports tidak punya collection sendiri - semua data dari aggregation
4. **Debug Endpoints**: Gunakan `/debug/verify` dan `/debug/answer-to-report` untuk troubleshooting
5. **Error Testing**: Test edge cases dengan data missing untuk memastikan robustness