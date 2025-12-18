# 📋 Quick Testing Checklist

## 🚀 **STEP-BY-STEP MANUAL TESTING**

### **Phase 1: Account Creation**
```bash
□ 1. Create Admin Account (POST /auth/register)
□ 2. Create Guru Account (POST /auth/register) 
□ 3. Create Siswa Account (POST /auth/register)
□ 4. Login Admin (POST /auth/login) → Save token
□ 5. Login Guru (POST /auth/login) → Save token  
□ 6. Login Siswa (POST /auth/login) → Save token
```

### **Phase 2: Admin Testing**
```bash
□ 7. Admin - Create User (POST /users) → Should work ✅
□ 8. Admin - View All Users (GET /users) → Should work ✅
□ 9. Admin - Create Soal (POST /soals) → Should work ✅
□ 10. Admin - View Statistics (GET /statistics) → Should work ✅
□ 11. Admin - View Reports (GET /reports) → Should work ✅
```

### **Phase 3: Guru Testing**  
```bash
□ 12. Guru - Try Create User (POST /users) → Should fail ❌
□ 13. Guru - View Users (GET /users) → Should work ✅
□ 14. Guru - Create Soal (POST /soals) → Should work ✅
□ 15. Guru - View Reports (GET /reports) → Should work ✅
□ 16. Guru - Try Delete Report (DELETE /reports/:id) → Should fail ❌
□ 17. Guru - Try Full Statistics (GET /statistics) → Should fail ❌
```

### **Phase 4: Siswa Testing**
```bash
□ 18. Siswa - Try View Users (GET /users) → Should fail ❌
□ 19. Siswa - Try Create Soal (POST /soals) → Should fail ❌
□ 20. Siswa - Get Soal (GET /answer/MTK001) → Should work ✅
□ 21. Siswa - Submit Answer (POST /answer/MTK001) → Should work ✅
□ 22. Check Enhanced Feedback in response → Should include AI feedback ✅
```

### **Phase 5: Enhanced Features**
```bash
□ 23. Verify AI feedback in answer response
□ 24. Check pass/fail status based on minimal nilai
□ 25. Verify auto user_id injection for siswa
□ 26. Test profile update for all roles
```

## 🎯 **Test Data Examples:**

### **Admin Account:**
```json
{
  "username": "admin01",
  "password": "admin123", 
  "namaLengkap": "Administrator Test",
  "nipNim": "ADM001",
  "role": "admin"
}
```

### **Guru Account:**
```json
{
  "username": "guru01",
  "password": "guru123",
  "namaLengkap": "Budi Santoso", 
  "nipNim": "GR001",
  "role": "guru",
  "mataPelajaran": "Matematika"
}
```

### **Siswa Account:**
```json
{
  "username": "siswa01",
  "password": "siswa123",
  "namaLengkap": "Siti Nurhaliza",
  "nipNim": "SW001", 
  "role": "siswa",
  "kelas": "10A"
}
```

### **Sample Soal:**
```json
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
    }
  ]
}
```

### **Sample Answer:**
```json
{
  "jawaban": {
    "1": "b"
  }
}
```

## 🔍 **Expected Results:**

### **✅ Should Work:**
- Admin: All endpoints
- Guru: Soal management, view reports, limited stats
- Siswa: Answer submission, profile management

### **❌ Should Fail (403):**
- Guru: User management, delete operations
- Siswa: All management endpoints
- Any: Access without proper token

## 📊 **Success Indicators:**

✅ **Authentication:** All accounts can login and get JWT tokens  
✅ **Authorization:** Role-based access properly enforced  
✅ **Enhanced Feedback:** AI feedback and academic advice in responses  
✅ **Security:** Password hashing, token validation working

**Server: http://localhost:3002**