# Users API Documentation

## Endpoints yang Tersedia:

### 1. **POST** `/users` - Menambah User Baru
**Body:**
```json
{
  "username": "john_doe",
  "nipNim": "123456789",
  "role": "guru",
  "status": "aktif"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "_id": "67...",
    "username": "john_doe",
    "nipNim": "123456789",
    "role": "guru",
    "status": "aktif",
    "createdAt": "2025-10-01T...",
    "updatedAt": "2025-10-01T..."
  }
}
```

### 2. **GET** `/users` - Ambil Semua User
**Response:**
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": [...],
  "count": 5
}
```

### 3. **GET** `/users/:id` - Ambil User by ID
**Response:**
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "_id": "67...",
    "username": "john_doe",
    "nipNim": "123456789",
    "role": "guru",
    "status": "aktif"
  }
}
```

### 4. **PUT** `/users/:id` - Update User
**Body:**
```json
{
  "username": "john_updated",
  "role": "admin",
  "status": "tidak aktif"
}
```

### 5. **DELETE** `/users/:id` - Hapus User
**Response:**
```json
{
  "success": true,
  "message": "User john_doe berhasil dihapus"
}
```

## Field Validations:

- **username**: String, required, unique
- **nipNim**: String, required, unique (NIP untuk guru/admin, NIM untuk siswa)
- **role**: Enum ['admin', 'guru', 'siswa'], required
- **status**: Enum ['aktif', 'tidak aktif'], default: 'aktif'

## Testing dengan cURL:

### Test POST User:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_test",
    "nipNim": "ADM001",
    "role": "admin",
    "status": "aktif"
  }'
```

### Test GET All Users:
```bash
curl http://localhost:3000/users
```

### Test GET User by ID:
```bash
curl http://localhost:3000/users/USER_ID_HERE
```

### Test PUT Update User:
```bash
curl -X PUT http://localhost:3000/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "status": "tidak aktif"
  }'
```

### Test DELETE User:
```bash
curl -X DELETE http://localhost:3000/users/USER_ID_HERE
```