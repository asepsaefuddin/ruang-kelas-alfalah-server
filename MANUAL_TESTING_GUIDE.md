# 📋 Manual Testing Guide - Authentication & Authorization System

## 🎯 **PANDUAN TESTING MANUAL LENGKAP**

### 📝 **Prerequisites:**
- Server running di `http://localhost:3002`
- Tool untuk testing API (Postman, Thunder Client, atau curl)
- Database MongoDB Atlas terhubung

---

## 🚀 **STEP 1: CREATE TEST ACCOUNTS**

### **1.1 Create Admin Account**
```bash
POST http://localhost:3002/auth/register

Headers:
Content-Type: application/json

Body:
{
  "username": "admin01",
  "password": "admin123",
  "namaLengkap": "Administrator Test",
  "nipNim": "ADM001",
  "role": "admin"
}

Expected Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "_id": "...",
    "username": "admin01",
    "namaLengkap": "Administrator Test",
    "nipNim": "ADM001",
    "role": "admin",
    "status": "aktif"
  }
}
```

### **1.2 Create Guru Account**
```bash
POST http://localhost:3002/auth/register

Headers:
Content-Type: application/json

Body:
{
  "username": "guru01",
  "password": "guru123",
  "namaLengkap": "Budi Santoso",
  "nipNim": "GR001",
  "role": "guru",
  "mataPelajaran": "Matematika"
}

Expected Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "_id": "...",
    "username": "guru01",
    "namaLengkap": "Budi Santoso",
    "nipNim": "GR001",
    "role": "guru",
    "mataPelajaran": "Matematika",
    "status": "aktif"
  }
}
```

### **1.3 Create Siswa Account**
```bash
POST http://localhost:3002/auth/register

Headers:
Content-Type: application/json

Body:
{
  "username": "siswa01",
  "password": "siswa123",
  "namaLengkap": "Siti Nurhaliza",
  "nipNim": "SW001",
  "role": "siswa",
  "kelas": "10A"
}

Expected Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "_id": "...",
    "username": "siswa01",
    "namaLengkap": "Siti Nurhaliza",
    "nipNim": "SW001",
    "role": "siswa",
    "kelas": "10A",
    "status": "aktif"
  }
}
```

---

## 🔐 **STEP 2: LOGIN EACH ACCOUNT**

### **2.1 Login as Admin**
```bash
POST http://localhost:3002/auth/login

Headers:
Content-Type: application/json

Body:
{
  "username": "admin01",
  "password": "admin123"
}

Expected Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...},
    "expires_in": "7d"
  }
}

📝 SAVE THIS TOKEN AS: ADMIN_TOKEN
```

### **2.2 Login as Guru**
```bash
POST http://localhost:3002/auth/login

Body:
{
  "username": "guru01",
  "password": "guru123"
}

📝 SAVE THIS TOKEN AS: GURU_TOKEN
```

### **2.3 Login as Siswa**
```bash
POST http://localhost:3002/auth/login

Body:
{
  "username": "siswa01",
  "password": "siswa123"
}

📝 SAVE THIS TOKEN AS: SISWA_TOKEN
```

---

## 👑 **STEP 3: TEST ADMIN FEATURES**

### **3.1 Admin - User Management**
```bash
# Get All Users
GET http://localhost:3002/users
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (Should see all users)

# Create New User
POST http://localhost:3002/users
Authorization: Bearer {ADMIN_TOKEN}
Body:
{
  "username": "test01",
  "password": "test123",
  "namaLengkap": "Test User",
  "nipNim": "TST001",
  "role": "siswa",
  "kelas": "10B"
}

Expected: ✅ SUCCESS (User created)

# Update User
PUT http://localhost:3002/users/{user_id}
Authorization: Bearer {ADMIN_TOKEN}
Body:
{
  "namaLengkap": "Test User Updated"
}

Expected: ✅ SUCCESS (User updated)

# Delete User
DELETE http://localhost:3002/users/{user_id}
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (User deleted)
```

### **3.2 Admin - Soal Management**
```bash
# Create Soal
POST http://localhost:3002/soals
Authorization: Bearer {ADMIN_TOKEN}
Body:
{
  "kode": "MTK001",
  "judul": "Ujian Matematika Dasar",
  "minimalNilai": 75,
  "soal": [
    {
      "type": "pilihan ganda",
      "soal": "Berapa hasil dari 2 + 2?",
      "list_jawaban": ["a. 3", "b. 4", "c. 5", "d. 6"],
      "jawaban": "b"
    },
    {
      "type": "essay",
      "soal": "Jelaskan rumus luas segitiga",
      "jawaban": "Luas segitiga = 1/2 × alas × tinggi"
    }
  ]
}

Expected: ✅ SUCCESS (Soal created)

# Get All Soals
GET http://localhost:3002/soals
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (Should see all soals)
```

### **3.3 Admin - Statistics & Reports**
```bash
# Get All Statistics
GET http://localhost:3002/statistics
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (Full statistics data)

# Get AI Summary
GET http://localhost:3002/statistics/ai-summary
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (AI analysis)

# Get All Reports
GET http://localhost:3002/reports
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ SUCCESS (All reports visible)
```

---

## 👨‍🏫 **STEP 4: TEST GURU FEATURES**

### **4.1 Guru - User Management (Limited)**
```bash
# Get All Users (Should work)
GET http://localhost:3002/users
Authorization: Bearer {GURU_TOKEN}

Expected: ✅ SUCCESS (Can view users)

# Try Create User (Should fail)
POST http://localhost:3002/users
Authorization: Bearer {GURU_TOKEN}
Body: {...}

Expected: ❌ FORBIDDEN (403 error)

# Try Delete User (Should fail)
DELETE http://localhost:3002/users/{user_id}
Authorization: Bearer {GURU_TOKEN}

Expected: ❌ FORBIDDEN (403 error)
```

### **4.2 Guru - Soal Management**
```bash
# Create Soal (Should work)
POST http://localhost:3002/soals
Authorization: Bearer {GURU_TOKEN}
Body:
{
  "kode": "IPA001",
  "judul": "Ujian IPA Kelas 10",
  "minimalNilai": 70,
  "soal": [
    {
      "type": "pilihan ganda",
      "soal": "Apa simbol kimia untuk air?",
      "list_jawaban": ["a. H2O", "b. CO2", "c. O2", "d. H2"],
      "jawaban": "a"
    }
  ]
}

Expected: ✅ SUCCESS (Guru can create soal)

# Get All Soals
GET http://localhost:3002/soals
Authorization: Bearer {GURU_TOKEN}

Expected: ✅ SUCCESS (Can view soals)

# Update Soal
PUT http://localhost:3002/soals/{soal_id}
Authorization: Bearer {GURU_TOKEN}
Body: {"judul": "Updated Title"}

Expected: ✅ SUCCESS (Can update soal)
```

### **4.3 Guru - View Reports & Statistics**
```bash
# Get Reports (Should work)
GET http://localhost:3002/reports
Authorization: Bearer {GURU_TOKEN}

Expected: ✅ SUCCESS (Can view reports)

# Get Statistics Performance
GET http://localhost:3002/statistics/performance
Authorization: Bearer {GURU_TOKEN}

Expected: ✅ SUCCESS (Can view performance)

# Try Full Statistics (Should fail)
GET http://localhost:3002/statistics
Authorization: Bearer {GURU_TOKEN}

Expected: ❌ FORBIDDEN (403 error)

# Try Delete Report (Should fail)
DELETE http://localhost:3002/reports/{report_id}
Authorization: Bearer {GURU_TOKEN}

Expected: ❌ FORBIDDEN (403 error)
```

---

## 👨‍🎓 **STEP 5: TEST SISWA FEATURES**

### **5.1 Siswa - Answer System**
```bash
# Get Soal by Code (Should work)
GET http://localhost:3002/answer/MTK001
Authorization: Bearer {SISWA_TOKEN}

Expected: ✅ SUCCESS (Can view soal without answers)

# Submit Answer (Should work)
POST http://localhost:3002/answer/MTK001
Authorization: Bearer {SISWA_TOKEN}
Body:
{
  "jawaban": {
    "1": "b",
    "2": "Luas segitiga dihitung dengan rumus 1/2 × alas × tinggi"
  }
}

Expected: ✅ SUCCESS with Enhanced Feedback:
{
  "success": true,
  "data": {
    "percentage": 85,
    "is_lulus": true,
    "keterangan": {
      "minimal_untuk_lulus": "75%",
      "nilai_anda": "85%",
      "selisih": "+10% (di atas minimum)",
      "feedback_ai": "Excellent work! Keep it up!",
      "saran": "Selamat! Pertahankan prestasi Anda...",
      "status_akademik": "LULUS"
    }
  }
}
```

### **5.2 Siswa - Restricted Access**
```bash
# Try Access Users (Should fail)
GET http://localhost:3002/users
Authorization: Bearer {SISWA_TOKEN}

Expected: ❌ FORBIDDEN (403 error)

# Try Create Soal (Should fail)
POST http://localhost:3002/soals
Authorization: Bearer {SISWA_TOKEN}

Expected: ❌ FORBIDDEN (403 error)

# Try View Reports (Should fail)
GET http://localhost:3002/reports
Authorization: Bearer {SISWA_TOKEN}

Expected: ❌ FORBIDDEN (403 error)

# Try View Statistics (Should fail)
GET http://localhost:3002/statistics
Authorization: Bearer {SISWA_TOKEN}

Expected: ❌ FORBIDDEN (403 error)
```

### **5.3 Siswa - Profile Management**
```bash
# Get Profile (Should work)
GET http://localhost:3002/auth/profile
Authorization: Bearer {SISWA_TOKEN}

Expected: ✅ SUCCESS (Own profile data)

# Update Profile (Should work)
PUT http://localhost:3002/auth/profile
Authorization: Bearer {SISWA_TOKEN}
Body:
{
  "namaLengkap": "Siti Nurhaliza Updated",
  "password": "newsiswa123"
}

Expected: ✅ SUCCESS (Profile updated)
```

---

## 🔍 **STEP 6: VERIFY ANSWER FEEDBACK SYSTEM**

### **6.1 Test with Failing Score**
```bash
# Submit Poor Answer
POST http://localhost:3002/answer/IPA001
Authorization: Bearer {SISWA_TOKEN}
Body:
{
  "jawaban": {
    "1": "d"  // Wrong answer
  }
}

Expected Response should include:
{
  "keterangan": {
    "minimal_untuk_lulus": "70%",
    "nilai_anda": "0%",
    "selisih": "-70% (di bawah minimum)",
    "feedback_ai": "...",
    "saran": "Jangan menyerah! Pelajari kembali materi...",
    "status_akademik": "PERLU REMEDIAL"
  }
}
```

### **6.2 Test with Passing Score**
```bash
# Submit Good Answer
POST http://localhost:3002/answer/IPA001
Authorization: Bearer {SISWA_TOKEN}
Body:
{
  "jawaban": {
    "1": "a"  // Correct answer
  }
}

Expected Response should include:
{
  "keterangan": {
    "minimal_untuk_lulus": "70%",
    "nilai_anda": "100%",
    "selisih": "+30% (di atas minimum)",
    "feedback_ai": "...",
    "saran": "Selamat! Pertahankan prestasi Anda...",
    "status_akademik": "LULUS"
  }
}
```

---

## 📊 **STEP 7: TEST REPORTS AFTER ANSWERS**

### **7.1 Admin View Reports**
```bash
GET http://localhost:3002/reports
Authorization: Bearer {ADMIN_TOKEN}

Expected: ✅ Should see all student answers with grades
```

### **7.2 Guru View Reports**
```bash
GET http://localhost:3002/reports
Authorization: Bearer {GURU_TOKEN}

Expected: ✅ Should see student reports (read-only)
```

---

## ✅ **STEP 8: VALIDATION CHECKLIST**

### **Authentication Validation:**
- [ ] ✅ Admin dapat register dan login
- [ ] ✅ Guru dapat register dengan mataPelajaran
- [ ] ✅ Siswa dapat register dengan kelas
- [ ] ✅ JWT token generated untuk semua role
- [ ] ✅ Profile management works untuk semua role

### **Authorization Validation:**
- [ ] ✅ Admin: Full access ke semua endpoint
- [ ] ✅ Guru: Can manage soals, view reports, limited statistics
- [ ] ❌ Guru: Cannot manage users or delete reports
- [ ] ✅ Siswa: Can submit answers dan manage profile
- [ ] ❌ Siswa: Cannot access management endpoints

### **Enhanced Features Validation:**
- [ ] ✅ AI feedback dalam answer response
- [ ] ✅ Academic suggestions based on score
- [ ] ✅ Pass/fail status dengan minimal nilai
- [ ] ✅ Auto user_id injection untuk siswa
- [ ] ✅ Detailed scoring breakdown

### **Security Validation:**
- [ ] ✅ Passwords hashed in database
- [ ] ✅ JWT tokens expire after 7 days
- [ ] ✅ Role-based access strictly enforced
- [ ] ✅ Public endpoints accessible tanpa token

---

## 🎯 **EXPECTED BEHAVIOR SUMMARY:**

### **✅ SHOULD WORK:**
- Admin: Full system access
- Guru: Soal management + Reports viewing + Limited statistics
- Siswa: Answer submission + Enhanced feedback + Profile management

### **❌ SHOULD FAIL (403 Forbidden):**
- Guru trying to manage users
- Guru trying to delete reports  
- Siswa trying to access any management endpoint
- Any role accessing endpoints without proper authorization

---

## 🚀 **QUICK TEST COMMANDS:**

```bash
# Test server health (public)
GET http://localhost:3002/health

# Test unauthorized access (should fail)
GET http://localhost:3002/users

# Test with invalid token (should fail)
GET http://localhost:3002/users
Authorization: Bearer invalid_token
```

**Happy Testing! 🎉**

Ikuti langkah-langkah ini secara berurutan untuk memvalidasi bahwa sistem authentication dan authorization bekerja dengan sempurna sesuai requirements.