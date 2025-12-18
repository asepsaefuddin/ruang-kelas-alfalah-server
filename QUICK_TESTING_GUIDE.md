# 🚀 Quick Start Testing Guide

## ⚡ **SIMPLIFIED TESTING - User Management Public**

### **🎯 Step 1: Create Test Accounts (Tanpa Auth)**

Sekarang endpoint `POST /users` sudah public sementara untuk memudahkan testing.

#### **Create Admin Account:**
```bash
POST http://localhost:3002/users

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
```

#### **Create Guru Account:**
```bash
POST http://localhost:3002/users

Body:
{
  "username": "guru01",
  "password": "guru123",
  "namaLengkap": "Budi Santoso",
  "nipNim": "GR001",
  "role": "guru",
  "mataPelajaran": "Matematika"
}
```

#### **Create Siswa Account:**
```bash
POST http://localhost:3002/users

Body:
{
  "username": "siswa01",
  "password": "siswa123",
  "namaLengkap": "Siti Nurhaliza",
  "nipNim": "SW001",
  "role": "siswa",
  "kelas": "10A"
}
```

### **🔐 Step 2: Login & Get Tokens**

#### **Login Admin:**
```bash
POST http://localhost:3002/auth/login

Body:
{
  "username": "admin01",
  "password": "admin123"
}

Save token sebagai: ADMIN_TOKEN
```

#### **Login Guru:**
```bash
POST http://localhost:3002/auth/login

Body:
{
  "username": "guru01",
  "password": "guru123"
}

Save token sebagai: GURU_TOKEN
```

#### **Login Siswa:**
```bash
POST http://localhost:3002/auth/login

Body:
{
  "username": "siswa01",
  "password": "siswa123"
}

Save token sebagai: SISWA_TOKEN
```

### **🧪 Step 3: Quick Feature Testing**

#### **Test Admin Features:**
```bash
# Admin - Create Soal
POST http://localhost:3002/soals
Authorization: Bearer {ADMIN_TOKEN}
Body:
{
  "kode": "MTK001",
  "judul": "Ujian Matematika",
  "minimalNilai": 75,
  "soal": [
    {
      "type": "pilihan ganda",
      "soal": "Berapa 2 + 2?",
      "list_jawaban": ["a. 3", "b. 4", "c. 5"],
      "jawaban": "b"
    }
  ]
}

# Admin - View Statistics
GET http://localhost:3002/statistics
Authorization: Bearer {ADMIN_TOKEN}
```

#### **Test Guru Features:**
```bash
# Guru - View Users (Should work)
GET http://localhost:3002/users
Authorization: Bearer {GURU_TOKEN}

# Guru - Create Soal (Should work)
POST http://localhost:3002/soals
Authorization: Bearer {GURU_TOKEN}
Body: [Same as above with different kode]

# Guru - Try Full Statistics (Should fail)
GET http://localhost:3002/statistics
Authorization: Bearer {GURU_TOKEN}
Expected: 403 Forbidden
```

#### **Test Siswa Features:**
```bash
# Siswa - Get Soal (Should work)
GET http://localhost:3002/answer/MTK001
Authorization: Bearer {SISWA_TOKEN}

# Siswa - Submit Answer (Should work)
POST http://localhost:3002/answer/MTK001
Authorization: Bearer {SISWA_TOKEN}
Body:
{
  "jawaban": {
    "1": "b"
  }
}

# Check for enhanced feedback in response!

# Siswa - Try View Users (Should fail)
GET http://localhost:3002/users
Authorization: Bearer {SISWA_TOKEN}
Expected: 403 Forbidden
```

### **✅ Expected Behaviors:**

#### **Should Work (✅):**
- Create users via `POST /users` (Public sementara)
- All login endpoints
- Admin: Full access to all endpoints
- Guru: Soal management + limited viewing
- Siswa: Answer submission + enhanced feedback

#### **Should Fail (❌):**
- Guru accessing full statistics
- Siswa accessing any management endpoints
- Any protected endpoint without proper token

### **🎯 Key Testing Points:**

1. **User Creation**: Sekarang bisa langsung create users tanpa auth
2. **Login System**: Test JWT token generation
3. **Role Authorization**: Verify access restrictions
4. **Enhanced Feedback**: Check AI feedback dalam answer response
5. **Security**: Verify passwords are hashed

### **📱 Quick Test Commands:**

```bash
# Health check (always works)
GET http://localhost:3002/health

# Create user (now public)
POST http://localhost:3002/users

# Login 
POST http://localhost:3002/auth/login

# Test with token
GET http://localhost:3002/users
Authorization: Bearer {TOKEN}
```

## 🚨 **IMPORTANT NOTE:**

**POST /users** endpoint sekarang **PUBLIC** untuk memudahkan testing. 

Setelah testing selesai, hapus `@Public()` decorator untuk restore security!

**Happy Testing! 🎉**