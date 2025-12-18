# 🔐 Authentication & Authorization System

## ✅ **SISTEM AUTH LENGKAP BERHASIL DIBUAT!**

### 🎯 **Fitur Authentication & Authorization:**

#### ✅ **Authentication System:**
- **JWT Token Authentication** dengan expiry 7 hari
- **Password Hashing** menggunakan bcryptjs
- **Login/Register** dengan role-based validation
- **Profile Management** untuk update user data
- **Token Verification** untuk validasi JWT

#### ✅ **Authorization Matrix:**

| **Endpoint** | **Admin** | **Guru** | **Siswa** |
|--------------|-----------|----------|-----------|
| **Auth Endpoints** |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `GET /auth/profile` | ✅ | ✅ | ✅ |
| `PUT /auth/profile` | ✅ | ✅ | ✅ |
| `POST /auth/verify` | ✅ | ✅ | ✅ |
| **User Management** |
| `POST /users` | ✅ | ❌ | ❌ |
| `GET /users` | ✅ | ✅ | ❌ |
| `GET /users/:id` | ✅ | ✅ | ❌ |
| `PUT /users/:id` | ✅ | ❌ | ❌ |
| `DELETE /users/:id` | ✅ | ❌ | ❌ |
| `GET /users/siswa/kelas/:kelas` | ✅ | ✅ | ❌ |
| `GET /users/guru/mataPelajaran/:mp` | ✅ | ✅ | ❌ |
| `GET /users/reference/*` | ✅ | ✅ | ❌ |
| **Soal Management** |
| `POST /soals` | ✅ | ✅ | ❌ |
| `GET /soals` | ✅ | ✅ | ❌ |
| `GET /soals/:id` | ✅ | ✅ | ❌ |
| `PUT /soals/:id` | ✅ | ✅ | ❌ |
| `DELETE /soals/:id` | ✅ | ✅ | ❌ |
| **Answer System** |
| `GET /answer/:kode` | ✅ | ✅ | ✅ |
| `POST /answer/:kode` | ❌ | ❌ | ✅ |
| `GET /answer/results/all` | ✅ | ✅ | ❌ |
| `GET /answer/summary` | ✅ | ✅ | ❌ |
| `GET /answer/results/:kode` | ✅ | ✅ | ❌ |
| **Reports** |
| `GET /reports` | ✅ | ✅ | ❌ |
| `GET /reports/summary` | ✅ | ✅ | ❌ |
| `GET /reports/:id` | ✅ | ✅ | ❌ |
| `DELETE /reports/:id` | ✅ | ❌ | ❌ |
| `DELETE /reports/user/:uid/soal/:kode` | ✅ | ❌ | ❌ |
| **Statistics** |
| `GET /statistics` | ✅ | ❌ | ❌ |
| `GET /statistics/quick` | ✅ | ✅ | ❌ |
| `GET /statistics/users` | ✅ | ❌ | ❌ |
| `GET /statistics/performance` | ✅ | ✅ | ❌ |
| `GET /statistics/activity` | ✅ | ✅ | ❌ |
| `GET /statistics/ai-summary` | ✅ | ✅ | ❌ |

### 🚀 **Auth Endpoints:**

#### **1. Register User:**
```bash
POST /auth/register

Body:
{
  "username": "user123",
  "password": "password123",
  "namaLengkap": "User Test",
  "nipNim": "123456789",
  "role": "siswa", // "admin" | "guru" | "siswa"
  "kelas": "10A", // Required for siswa
  "mataPelajaran": "Matematika" // Required for guru
}

Response:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "_id": "...",
    "username": "user123",
    "namaLengkap": "User Test",
    "nipNim": "123456789",
    "role": "siswa",
    "kelas": "10A",
    "status": "aktif"
  }
}
```

#### **2. Login:**
```bash
POST /auth/login

Body:
{
  "username": "user123",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "username": "user123",
      "namaLengkap": "User Test",
      "role": "siswa",
      "kelas": "10A",
      "status": "aktif"
    },
    "expires_in": "7d"
  }
}
```

#### **3. Get Profile:**
```bash
GET /auth/profile
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Profile berhasil diambil",
  "data": {
    "_id": "...",
    "username": "user123",
    "namaLengkap": "User Test",
    "role": "siswa",
    "kelas": "10A",
    "status": "aktif"
  }
}
```

#### **4. Update Profile:**
```bash
PUT /auth/profile
Authorization: Bearer <access_token>

Body:
{
  "namaLengkap": "User Test Updated",
  "password": "newpassword123" // Optional
}

Response:
{
  "success": true,
  "message": "Profile berhasil diupdate",
  "data": { ... }
}
```

### 📊 **Enhanced Answer Response:**

#### **Siswa Submit Answer dengan Feedback AI:**
```bash
POST /answer/IPA001
Authorization: Bearer <access_token>

Body:
{
  "jawaban": {
    "1": "c",
    "2": "Sel tumbuhan memiliki dinding sel dan kloroplas"
  }
}

Response:
{
  "success": true,
  "message": "Jawaban berhasil disimpan dan dinilai",
  "data": {
    "answer_id": "...",
    "kode_soal": "IPA001",
    "total_score": 147,
    "max_score": 200,
    "percentage": 74,
    "is_lulus": false,
    "status_kelulusan": "TIDAK LULUS",
    "keterangan": {
      "minimal_untuk_lulus": "75%",
      "nilai_anda": "74%",
      "selisih": "-1% (di bawah minimum)",
      "feedback_ai": "Bagus! Hasil yang memuaskan, terus belajar untuk hasil yang lebih baik!",
      "saran": "Jangan menyerah! Pelajari kembali materi yang kurang dikuasai dan coba lagi.",
      "status_akademik": "PERLU REMEDIAL"
    },
    "detailed_results": [...]
  }
}
```

### 🔒 **Security Features:**

#### **Password Security:**
- **bcryptjs hashing** dengan salt rounds 10
- **Minimum password length** 6 karakter
- **Password tidak disimpan** dalam response

#### **JWT Security:**
- **Secret key** dari environment variable
- **Token expiry** 7 hari
- **Auto user_id injection** dari token untuk siswa

#### **Role-based Access:**
- **Global JWT Guard** untuk semua endpoint
- **Role-specific authorization** dengan decorators
- **Public routes** untuk login/register/health

### 🎯 **Permission Summary:**

#### **ADMIN:**
- ✅ **Full access** ke semua endpoint
- ✅ **User management** complete CRUD
- ✅ **Delete operations** untuk reports
- ✅ **Advanced statistics** dan monitoring

#### **GURU:**
- ✅ **Soal management** complete CRUD
- ✅ **View reports** dan student performance
- ✅ **Statistics** untuk monitoring
- ❌ **User management** dan delete operations

#### **SISWA:**
- ✅ **Submit answers** dengan auto user_id
- ✅ **View soal** berdasarkan kode
- ✅ **Profile management** 
- ❌ **Management endpoints** lainnya

### 🚀 **Usage Flow:**

#### **For Students:**
1. **Register** dengan role siswa + kelas
2. **Login** untuk mendapat JWT token
3. **GET /answer/:kode** untuk mengambil soal
4. **POST /answer/:kode** untuk submit jawaban
5. Terima **feedback AI** dan nilai otomatis

#### **For Teachers:**
1. **Register** dengan role guru + mata pelajaran
2. **Login** untuk mendapat JWT token  
3. **POST /soals** untuk membuat soal
4. **GET /reports** untuk melihat hasil siswa
5. **GET /statistics/performance** untuk analisis

#### **For Admins:**
1. **Login** sebagai admin
2. **Full access** ke semua fitur
3. **User management** dan monitoring
4. **Advanced analytics** dan AI summary

### ✅ **Server Status:**

🚀 **Server running pada http://localhost:3002**

**All endpoints dengan authentication & authorization sudah aktif!**

#### **Sample Auth Headers:**
```bash
# Setelah login, gunakan token di header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Public endpoints (tidak perlu token):
GET /
GET /health
POST /auth/login
POST /auth/register
```

## 🎉 **SISTEM AUTHENTICATION & AUTHORIZATION LENGKAP!** 

✅ **JWT Authentication** ✅ **Role-based Authorization** ✅ **Enhanced Feedback** ✅ **Security Best Practices**