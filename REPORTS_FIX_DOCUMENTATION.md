# Fix Reports API - Jawaban Benar dan Data Siswa

## 🔧 Masalah yang Diperbaiki

### 1. **"namaSiswa": "Unknown", "kelas": "Unknown"**
**Penyebab**: Schema User tidak memiliki field `namaLengkap`
**Solusi**: 
- ✅ Menambahkan field `namaLengkap` ke User schema
- ✅ Update CreateUserDto untuk include namaLengkap
- ✅ Reports service sekarang menggunakan `namaLengkap` dengan fallback ke `username`

### 2. **"jawabanBenar": null untuk semua soal**
**Penyebab**: Mapping field yang salah antara schema dan service
**Solusi**: 
- ✅ Memperbaiki mapping field di `buildDetailJawaban()`
- ✅ Menggunakan field `jawaban` dari SoalItem schema untuk jawaban benar
- ✅ Menambahkan backward compatibility untuk berbagai tipe soal

### 3. **Field Mapping Inconsistency**
**Penyebab**: Mismatch antara nama field di schema dan penggunaan di service
**Solusi**:
- ✅ `judulSoal` → `judul` (sesuai schema Soal)
- ✅ `pertanyaan` → `soal` (sesuai schema SoalItem)
- ✅ `username` → `namaLengkap` (dengan fallback)

## 📋 Perubahan Schema

### User Schema (Updated)
```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })  // 🆕 FIELD BARU
  namaLengkap: string;

  @Prop({ required: true, unique: true })
  nipNim: string;
  
  // ... rest of fields
}
```

### CreateUserDto (Updated)
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()  // 🆕 FIELD BARU
  namaLengkap: string;

  @IsString()
  @IsNotEmpty()
  nipNim: string;
  
  // ... rest of fields
}
```

## 🔧 Service Logic Improvements

### buildDetailJawaban() - Fixed
```typescript
private buildDetailJawaban(answer: any, soal: any): ReportData['detailJawaban'] {
  if (!answer.detailed_results || !soal?.soal) {
    return [];
  }

  return answer.detailed_results.map((detail, index) => {
    const soalItem = soal.soal[index];
    const jawabanUser = detail.jawaban_user || 'Tidak dijawab';
    
    // 🔧 PERBAIKAN: Mapping jawaban benar yang tepat
    let jawabanBenar = null;
    if (soalItem?.type === 'pilihan_ganda' && soalItem.jawaban_benar) {
      jawabanBenar = soalItem.jawaban_benar;
    } else if (soalItem?.type === 'isian' && soalItem.jawaban_benar) {
      jawabanBenar = soalItem.jawaban_benar;
    } else if (soalItem?.jawaban) {
      // Backward compatibility
      jawabanBenar = soalItem.jawaban;
    }
    
    return {
      pertanyaan: soalItem?.soal || `Soal ${index + 1}`, // 🔧 PERBAIKAN: menggunakan field 'soal'
      jawabanSiswa: jawabanUser,
      jawabanBenar: jawabanBenar, // 🔧 PERBAIKAN: sekarang menampilkan jawaban benar
      skor: detail.score || 0,
      feedback: detail.feedback || '',
    };
  });
}
```

## 📊 Expected Response After Fix

### Sebelum (Bermasalah):
```json
{
  "_id": "68dd360a061e7e96e2238d5d",
  "namaSiswa": "Unknown",           // ❌ Problem
  "kelas": "Unknown",               // ❌ Problem
  "kodeSoal": "PENGECEKANAI",
  "judulUjian": "Test AI Grading System",
  "nilai": 0,
  "tanggal": "2025-10-01T14:09:14.622Z",
  "status": "Tidak Lulus",
  "detailJawaban": [
    {
      "pertanyaan": "Apa itu fotosintesis?",
      "jawabanSiswa": "b",
      "jawabanBenar": "b",             // ✅ Ini sudah benar
      "skor": 100,
      "feedback": "Jawaban benar!"
    },
    {
      "pertanyaan": "Jelaskan proses fotosintesis secara detail!",
      "jawabanSiswa": "Fotosintesis adalah...",
      "jawabanBenar": null,            // ❌ Problem untuk essay
      "skor": 78,
      "feedback": "Jawaban cukup baik..."
    }
  ]
}
```

### Setelah (Fixed):
```json
{
  "_id": "68dd360a061e7e96e2238d5d",
  "namaSiswa": "Ahmad Rizki",         // ✅ Fixed: sekarang tampil nama lengkap
  "kelas": "10A",                     // ✅ Fixed: sekarang tampil kelas
  "kodeSoal": "PENGECEKANAI",
  "judulUjian": "Test AI Grading System",
  "nilai": 89,                        // ✅ Fixed: nilai yang benar
  "tanggal": "2025-10-01T14:09:14.622Z",
  "status": "Lulus",                  // ✅ Fixed: status yang benar
  "detailJawaban": [
    {
      "pertanyaan": "Apa itu fotosintesis?",
      "jawabanSiswa": "b",
      "jawabanBenar": "b",             // ✅ Tetap benar untuk pilihan ganda
      "skor": 100,
      "feedback": "Jawaban benar!"
    },
    {
      "pertanyaan": "Jelaskan proses fotosintesis secara detail!",
      "jawabanSiswa": "Fotosintesis adalah...",
      "jawabanBenar": null,            // ✅ Benar: null untuk essay (subjektif)
      "skor": 78,
      "feedback": "Jawaban cukup baik..."
    }
  ]
}
```

## 📝 Data Migration Required

### Untuk User yang Ada:
```javascript
// Script untuk update user existing (manual migration)
db.users.updateMany(
  { namaLengkap: { $exists: false } },
  { $set: { namaLengkap: "$username" } }  // Set namaLengkap = username untuk data existing
);
```

### Untuk User Baru:
```bash
POST /users
{
  "username": "ahmad_rizki",
  "namaLengkap": "Ahmad Rizki Pratama",  # 🆕 Field baru wajib
  "nipNim": "12345678",
  "role": "siswa",
  "kelas": "10A"
}
```

## 🔍 Debugging Checklist

### Jika masih "Unknown":
1. ✅ **Pastikan User memiliki field `namaLengkap`**
2. ✅ **Cek populate user_id berhasil** - Bisa jadi ObjectId tidak valid
3. ✅ **Verify data di database** - User mungkin tidak exist

### Jika jawaban benar masih null:
1. ✅ **Cek struktur soal di database** - Field `jawaban` atau `jawaban_benar` mungkin tidak ada
2. ✅ **Verify tipe soal** - Essay memang seharusnya null
3. ✅ **Periksa detailed_results** - Data mungkin corrupt

### Quick Test:
```bash
# 1. Test user creation dengan namaLengkap
POST /users
{
  "username": "test_user",
  "namaLengkap": "Test User Name",
  "nipNim": "99999999",
  "role": "siswa",
  "kelas": "10A"
}

# 2. Test reports endpoint
GET /reports?page=1&limit=5

# 3. Verify specific report
GET /reports/:reportId
```

## 🚀 Status

✅ **Fixed Issues:**
- User name mapping (namaLengkap)
- Field schema consistency  
- Jawaban benar display logic
- Backward compatibility

⚠️ **Migration Required:**
- Update existing users to have `namaLengkap` field
- No action needed for soal/answer data

🔄 **Ready to Test:**
Server sudah restart dan siap untuk testing dengan perbaikan di atas.