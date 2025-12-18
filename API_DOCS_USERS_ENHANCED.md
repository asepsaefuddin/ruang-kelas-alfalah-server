# API Documentation - Enhanced Users Endpoint dengan Role-Based Fields

## Base URL
```
http://localhost:3001
```

## 👥 ENHANCED USERS ENDPOINTS

### 📋 **Field Structure Berdasarkan Role:**

#### **Admin:**
- `username` ✅
- `nipNim` ✅ 
- `role`: "admin" ✅
- `status`: "aktif"/"tidak aktif" ✅

#### **Guru:**
- `username` ✅
- `nipNim` ✅
- `role`: "guru" ✅
- `status`: "aktif"/"tidak aktif" ✅
- `mataPelajaran` ✅ **WAJIB** (contoh: "Matematika", "Bahasa Indonesia")

#### **Siswa:**
- `username` ✅
- `nipNim` ✅
- `role`: "siswa" ✅
- `status`: "aktif"/"tidak aktif" ✅
- `kelas` ✅ **WAJIB** (contoh: "10A", "11IPA1", "12IPS2")

---

## 🆕 **CRUD ENDPOINTS**

### 1. **POST /users** - Buat User Baru

#### **Admin:**
```json
{
  "username": "admin01",
  "nipNim": "ADM001",
  "role": "admin",
  "status": "aktif"
}
```

#### **Guru:**
```json
{
  "username": "pak_budi",
  "nipNim": "196801011990031001",
  "role": "guru",
  "status": "aktif",
  "mataPelajaran": "Matematika"
}
```

#### **Siswa:**
```json
{
  "username": "andi_siswa",
  "nipNim": "2024001",
  "role": "siswa", 
  "status": "aktif",
  "kelas": "10A"
}
```

### 2. **GET /users** - Ambil Semua User (dengan Filter)

#### **Query Parameters:**
- `page`: halaman (default: 1)
- `limit`: batas data per halaman (default: 10)
- `role`: filter berdasarkan role ("admin", "guru", "siswa")
- `kelas`: filter siswa berdasarkan kelas
- `mataPelajaran`: filter guru berdasarkan mata pelajaran

#### **Examples:**
```http
GET /users                           # Semua user
GET /users?role=siswa               # Hanya siswa
GET /users?role=guru                # Hanya guru
GET /users?kelas=10A                # Siswa kelas 10A
GET /users?mataPelajaran=Matematika # Guru matematika
GET /users?role=siswa&kelas=11IPA1  # Siswa kelas 11IPA1
```

### 3. **GET /users/:_id** - Ambil User by ID
```http
GET /users/674dd14ad967cab43b7af5c4c
```

### 4. **PUT /users/:_id** - Update User
```http
PUT /users/674dd14ad967cab43b7af5c4c
Content-Type: application/json

{
  "username": "updated_username",
  "kelas": "11A"  // untuk siswa
}
```

### 5. **DELETE /users/:_id** - Hapus User
```http
DELETE /users/674dd14ad967cab43b7af5c4c
```

---

## 🎯 **SPECIALIZED ENDPOINTS**

### 6. **GET /users/siswa/kelas/:kelas** - Siswa by Kelas
```http
GET /users/siswa/kelas/10A
```

**Response:**
```json
{
  "success": true,
  "message": "Data siswa kelas 10A berhasil diambil",
  "data": [
    {
      "_id": "...",
      "username": "andi_siswa",
      "nipNim": "2024001",
      "role": "siswa",
      "status": "aktif",
      "kelas": "10A"
    }
  ]
}
```

### 7. **GET /users/guru/mataPelajaran/:mataPelajaran** - Guru by Mata Pelajaran
```http
GET /users/guru/mataPelajaran/Matematika
```

**Response:**
```json
{
  "success": true,
  "message": "Data guru mata pelajaran Matematika berhasil diambil",
  "data": [
    {
      "_id": "...",
      "username": "pak_budi",
      "nipNim": "196801011990031001",
      "role": "guru",
      "status": "aktif",
      "mataPelajaran": "Matematika"
    }
  ]
}
```

### 8. **GET /users/reference/kelas** - Semua Kelas Available
```http
GET /users/reference/kelas
```

**Response:**
```json
{
  "success": true,
  "message": "Data semua kelas berhasil diambil",
  "data": ["10A", "10B", "11IPA1", "11IPA2", "12IPS1"]
}
```

### 9. **GET /users/reference/mataPelajaran** - Semua Mata Pelajaran Available
```http
GET /users/reference/mataPelajaran
```

**Response:**
```json
{
  "success": true,
  "message": "Data semua mata pelajaran berhasil diambil",
  "data": ["Matematika", "Bahasa Indonesia", "Fisika", "Kimia", "Sejarah"]
}
```

---

## ✅ **VALIDATION RULES**

### **Siswa:**
- ❌ `kelas` WAJIB diisi
- ❌ Error jika `kelas` kosong: "Kelas wajib diisi untuk siswa"

### **Guru:**
- ❌ `mataPelajaran` WAJIB diisi
- ❌ Error jika `mataPelajaran` kosong: "Mata pelajaran wajib diisi untuk guru"

### **Admin:**
- ✅ Field `kelas` dan `mataPelajaran` otomatis dihapus
- ✅ Tidak ada field tambahan required

---

## 🧪 **TESTING EXAMPLES**

### **Test Create Siswa:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "siswa_test",
    "nipNim": "2024999",
    "role": "siswa",
    "kelas": "10A"
  }'
```

### **Test Create Guru:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "guru_test",
    "nipNim": "198001011999031001",
    "role": "guru",
    "mataPelajaran": "Fisika"
  }'
```

### **Test Filter Siswa Kelas 10A:**
```bash
curl "http://localhost:3001/users?role=siswa&kelas=10A"
```

### **Test Get Guru Matematika:**
```bash
curl "http://localhost:3001/users/guru/mataPelajaran/Matematika"
```

---

## 📊 **RESPONSE EXAMPLES**

### **Successful User Creation:**
```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "_id": "674dd14ad967cab43b7af5c4c",
    "username": "siswa_test",
    "nipNim": "2024999",
    "role": "siswa",
    "status": "aktif",
    "kelas": "10A",
    "createdAt": "2025-01-10T10:30:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

### **Validation Error Example:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Kelas wajib diisi untuk siswa",
  "error": "Bad Request"
}
```

## 🎯 **New Features Summary:**
1. ✅ **Role-based Fields**: Kelas untuk siswa, mata pelajaran untuk guru
2. ✅ **Smart Validation**: Field wajib berdasarkan role
3. ✅ **Advanced Filtering**: Filter berdasarkan role, kelas, mata pelajaran
4. ✅ **Specialized Endpoints**: Endpoint khusus per role
5. ✅ **Reference Endpoints**: List semua kelas dan mata pelajaran
6. ✅ **Enhanced CRUD**: Semua operasi mendukung field baru