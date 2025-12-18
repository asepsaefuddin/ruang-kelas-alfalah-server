# Fix: Correct Endpoint URLs for Reports Delete

## ❌ **Error yang Terjadi:**

```bash
# SALAH: Missing /reports prefix
DELETE http://localhost:3002/user/68dd27336c786d4f29889da2/soal/IPA001

# Error Response:
{
  "message": "Cannot GET /user/68dd27336c786d4f29889da2/soal/IPA001",
  "error": "Not Found",
  "statusCode": 404
}
```

## ✅ **Endpoint yang Benar:**

```bash
# BENAR: With /reports prefix
DELETE http://localhost:3002/reports/user/68dd27336c786d4f29889da2/soal/IPA001
```

## 📋 **All Correct Reports Endpoints:**

### **1. List Reports**
```bash
GET http://localhost:3002/reports
GET http://localhost:3002/reports?page=1&limit=10
GET http://localhost:3002/reports?kelas=10A
GET http://localhost:3002/reports?status=Lulus
GET http://localhost:3002/reports?kodeSoal=IPA001
```

### **2. Get Specific Report**
```bash
GET http://localhost:3002/reports/{reportId}
# Example:
GET http://localhost:3002/reports/68dd360a061e7e96e2238d5d
```

### **3. Reports Summary**
```bash
GET http://localhost:3002/reports/summary
```

### **4. Debug Endpoints**
```bash
GET http://localhost:3002/reports/debug/verify/{answerId}
GET http://localhost:3002/reports/debug/answer-to-report/{answerId}
```

### **5. Delete Endpoints** 
```bash
# Delete single report
DELETE http://localhost:3002/reports/{reportId}
# Example:
DELETE http://localhost:3002/reports/68dd360a061e7e96e2238d5d

# Delete all user answers for specific soal
DELETE http://localhost:3002/reports/user/{userId}/soal/{soalKode}
# Example:
DELETE http://localhost:3002/reports/user/68dd27336c786d4f29889da2/soal/IPA001
```

## 🧪 **Testing with Correct URLs:**

### **Test 1: Fix Your Current Request**
```bash
# Your request (FIXED):
DELETE http://localhost:3002/reports/user/68dd27336c786d4f29889da2/soal/IPA001

# Expected Response:
{
  "success": true,
  "message": "Semua laporan nilai user untuk soal tersebut berhasil dihapus",
  "data": {
    "deleted_count": 2,
    "user_info": {
      "user_id": "68dd27336c786d4f29889da2",
      "username": "student_name",
      "namaLengkap": "Student Full Name"
    },
    "soal_kode": "IPA001",
    "deleted_answer_ids": ["answer_id_1", "answer_id_2"],
    "note": "Menghapus semua 2 answer dari user ... untuk soal IPA001"
  }
}
```

### **Test 2: Verify Reports List First**
```bash
# 1. Check available reports
GET http://localhost:3002/reports

# 2. Find reports for user 68dd27336c786d4f29889da2
GET http://localhost:3002/reports?page=1&limit=20

# 3. Filter by soal IPA001
GET http://localhost:3002/reports?kodeSoal=IPA001

# 4. Then delete specific user's answers
DELETE http://localhost:3002/reports/user/68dd27336c786d4f29889da2/soal/IPA001
```

### **Test 3: Alternative - Delete by Specific Report ID**
```bash
# 1. Get report ID from list
GET http://localhost:3002/reports?kodeSoal=IPA001

# 2. Delete specific report (one by one)
DELETE http://localhost:3002/reports/{specific_report_id}
```

## 🛠️ **Debugging Steps:**

### **Step 1: Verify Server Routes**
Server log shows mapped routes:
```
[RouterExplorer] Mapped {/reports/user/:userId/soal/:soalKode, DELETE} route ✅
```

### **Step 2: Check if User & Soal Exist**
```bash
# Verify user exists
GET http://localhost:3002/users/68dd27336c786d4f29889da2

# Verify soal with code IPA001 exists
GET http://localhost:3002/soals
# Look for soal with kode: "IPA001"

# Verify answers exist for this user and soal
GET http://localhost:3002/answer/results/all
# Look for answers with user_id: 68dd27336c786d4f29889da2 and kode_soal: IPA001
```

### **Step 3: Test Debug Endpoint**
```bash
# Check if any answers exist for this user
GET http://localhost:3002/reports/debug/verify/{any_answer_id_from_this_user}
```

## 📝 **Complete Working Example:**

```bash
# 1. List all reports to see available data
curl -X GET "http://localhost:3002/reports?page=1&limit=10"

# 2. Filter for specific soal
curl -X GET "http://localhost:3002/reports?kodeSoal=IPA001"

# 3. Delete all answers from specific user for IPA001
curl -X DELETE "http://localhost:3002/reports/user/68dd27336c786d4f29889da2/soal/IPA001"

# 4. Verify deletion
curl -X GET "http://localhost:3002/reports?kodeSoal=IPA001"
```

## ⚠️ **Common Mistakes:**

❌ `/user/...` (Missing reports prefix)
❌ `/reports/users/...` (Wrong plural)
❌ `/reports/user/soal/...` (Missing parameters)
❌ `GET` instead of `DELETE` for delete operations

✅ `/reports/user/{userId}/soal/{soalKode}` (Correct format)

## 🔍 **If Still Getting 404:**

Possible causes:
1. **No answers exist** for that user + soal combination
2. **User ID invalid** (check if user exists)
3. **Soal code wrong** (check exact spelling: "IPA001")
4. **HTTP method wrong** (use DELETE, not GET)

Test with:
```bash
# Check what answers actually exist
GET http://localhost:3002/answer/results/all?page=1&limit=50
```