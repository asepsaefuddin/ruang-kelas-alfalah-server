import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Soal, SoalDocument } from './schemas/soal.schema';
import { AnswerResult, AnswerResultDocument } from './schemas/answer-result.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateSoalDto } from './dto/create-soal.dto';
import { UpdateSoalDto } from './dto/update-soal.dto';

@Injectable()
export class SoalsService {
  constructor(
    @InjectModel(Soal.name) private soalModel: Model<SoalDocument>,
    @InjectModel(AnswerResult.name) private answerResultModel: Model<AnswerResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createSoalDto: CreateSoalDto): Promise<Soal> {
    try {
      const newSoal = new this.soalModel(createSoalDto);
      return await newSoal.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Kode soal sudah ada');
      }
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Soal[]; count: number; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.soalModel.find().skip(skip).limit(limit).exec(),
      this.soalModel.countDocuments(),
    ]);

    return { data, count: data.length, total, page, limit };
  }

  async findOne(id: string): Promise<Soal> {
    const soal = await this.soalModel.findById(id).exec();
    if (!soal) {
      throw new NotFoundException('Soal tidak ditemukan');
    }
    return soal;
  }

  // Fungsi internal baru untuk mengambil data soal murni tanpa pengecekan riwayat
  private async findSoalByKode(kode: string): Promise<SoalDocument> {
    const soal = await this.soalModel.findOne({ kode }).exec();
    if (!soal) {
      throw new NotFoundException(`Soal dengan kode "${kode}" tidak ditemukan.`);
    }
    return soal;
  }

  async findByKode(kode: string, userId?: string): Promise<Soal | any> {
    const soal = await this.soalModel.findOne({ kode }).exec();
    if (!soal) {
      throw new NotFoundException('Soal dengan kode tersebut tidak ditemukan');
    }

    // Cek apakah user sudah pernah submit untuk kode ujian ini, jika userId diberikan
    if (userId && isValidObjectId(userId)) {
      const existingResult = await this.answerResultModel.findOne({ 
        kodeUjian: kode, 
        userId: userId 
      }).exec();

      if (existingResult) {
        // Jika sudah pernah submit, kembalikan hasil yang sudah ada
        // Ini akan ditangkap oleh frontend sebagai 'sudah_submit: true'
        return { sudah_submit: true, hasil_ujian: existingResult.toObject() } as any;
      }
    }
    return soal;
  }

  async update(id: string, updateSoalDto: UpdateSoalDto): Promise<Soal> {
    try {
      const updatedSoal = await this.soalModel
        .findByIdAndUpdate(id, updateSoalDto, { new: true })
        .exec();

      if (!updatedSoal) {
        throw new NotFoundException('Soal tidak ditemukan');
      }
      return updatedSoal;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Kode soal sudah ada');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedSoal = await this.soalModel.findByIdAndDelete(id).exec();
    if (!deletedSoal) {
      throw new NotFoundException('Soal tidak ditemukan');
    }

    return { message: 'Soal berhasil dihapus' };
  }

  // ==================== METHODS UNTUK SISWA ====================

  async submitJawaban(
    kodeUjian: string, 
    userId: string, 
    jawabanSiswa: Array<{ pertanyaanId: string; jawaban: string }>
  ): Promise<AnswerResult> {
    // Validate userId format
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Format User ID tidak valid');
    }

    // Get user data
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Cari soal berdasarkan kode
    const soal = await this.findSoalByKode(kodeUjian);
    
    // Cek apakah siswa sudah pernah mengerjakan ujian ini
    const existingResult = await this.answerResultModel.findOne({ 
      kodeUjian, 
      userId 
    }).exec();
    
    if (existingResult) {
      throw new BadRequestException('Anda sudah mengerjakan ujian ini');
    }

    // Validate jawaban input
    if (!jawabanSiswa || jawabanSiswa.length === 0) {
      throw new BadRequestException('Jawaban tidak boleh kosong');
    }

    // Hitung nilai
    let benar = 0;
    let salah = 0;
    const processedAnswers: Array<{ pertanyaanId: string; jawaban: string; isCorrect: boolean }> = [];
    const waktuMulai = new Date();

    for (const jawaban of jawabanSiswa) {
      // Find question by index (pertanyaanId is actually the index)
      const questionIndex = parseInt(jawaban.pertanyaanId);
      const pertanyaan = soal.soal[questionIndex];
      
      if (!pertanyaan) {
        console.warn(`Question not found for index: ${questionIndex}`);
        continue;
      }

      let isCorrect = false;
      if (pertanyaan.type === 'pilihan ganda') {
        // For multiple choice, correct answer is the first item in list_jawaban
        isCorrect = !!pertanyaan.list_jawaban && 
                   pertanyaan.list_jawaban.length > 0 && 
                   jawaban.jawaban === pertanyaan.list_jawaban[0];
      } else if (pertanyaan.type === 'essay') {
        // For essay, compare with the correct answer (case-insensitive)
        if (pertanyaan.jawaban) {
          isCorrect = jawaban.jawaban.toLowerCase().trim() === pertanyaan.jawaban.toLowerCase().trim();
        }
      }

      if (isCorrect) benar++;
      else salah++;

      processedAnswers.push({
        pertanyaanId: jawaban.pertanyaanId,
        jawaban: jawaban.jawaban,
        isCorrect
      });
    }

    const totalPertanyaan = soal.soal.length;
    const nilai = totalPertanyaan > 0 ? Math.round((benar / totalPertanyaan) * 100) : 0;
    const lulus = nilai >= soal.minimalNilai;
    const waktuSelesai = new Date();
    const durasiPengerjaan = Math.round((waktuSelesai.getTime() - waktuMulai.getTime()) / 1000); // in seconds

    // Simpan hasil dengan data user yang sebenarnya
    const answerResult = new this.answerResultModel({
      kodeUjian,
      userId,
      username: user.username,
      namaLengkap: user.namaLengkap,
      jawaban: processedAnswers,
      nilai,
      totalPertanyaan,
      benar,
      salah,
      lulus,
      waktuMulai,
      waktuSelesai,
      durasiPengerjaan
    });

    try {
      return await answerResult.save();
    } catch (error) {
      console.error('Error saving answer result:', error);
      throw new BadRequestException('Gagal menyimpan hasil ujian');
    }
  }

  async getHasilUjian(kodeUjian: string, userId: string): Promise<AnswerResult> {
    const hasil = await this.answerResultModel.findOne({ 
      kodeUjian, 
      userId 
    }).exec();
    
    if (!hasil) {
      throw new NotFoundException('Hasil ujian tidak ditemukan');
    }
    
    return hasil;
  }

  async getAllHasilByKode(kodeUjian: string): Promise<AnswerResult[]> {
    return await this.answerResultModel.find({ kodeUjian }).exec();
  }
}