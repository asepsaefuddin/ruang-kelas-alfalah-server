import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../answers/schemas/answer.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Soal, SoalDocument } from '../soals/schemas/soal.schema';

export interface ReportData {
  _id: string;
  namaSiswa: string;
  kelas: string;
  nipNim: string;
  kodeSoal: string;
  judulUjian: string;
  nilai: number;
  durasi: number;
  minimalNilai: number;
  tanggal: Date;
  status: 'Lulus' | 'Tidak Lulus';
  detailJawaban: {
    pertanyaan: string;
    jawabanSiswa: string;
    jawabanBenar?: string;
    skor: number;
    feedback?: string;
    isCorrect?: boolean;
  }[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Soal.name) private soalModel: Model<SoalDocument>,
  ) {}

  async getAllReports(
    page: number = 1,
    limit: number = 10,
    kelas?: string,
    status?: 'Lulus' | 'Tidak Lulus',
    kodeSoal?: string,
  ) {
    const pipeline: any[] = [];

    // --- Tahap 1: Filter Awal (Match) ---
    const matchStage: any = {};
    if (status) {
      matchStage.isLulus = status === 'Lulus';
    }
    if (kodeSoal) {
      matchStage.kode_soal = kodeSoal;
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // --- Tahap 2: Join dengan User (Lookup) ---
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    });
    pipeline.push({ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } });

    // --- Tahap 3: Filter berdasarkan Kelas dari User ---
    if (kelas) {
      pipeline.push({ $match: { 'user.kelas': kelas } });
    }

    // --- Tahap 4: Join dengan Soal (Lookup) ---
    pipeline.push({
      $lookup: {
        from: 'soals',
        localField: 'soal_id',
        foreignField: '_id',
        as: 'soal',
      },
    });
    pipeline.push({ $unwind: { path: '$soal', preserveNullAndEmptyArrays: true } });

    // --- Tahap 5: Paginasi dan Pengambilan Data ---
    const facetStage = {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalItems: [{ $count: 'count' }],
      },
    };
    pipeline.push(facetStage);

    const result = await this.answerModel.aggregate(pipeline).exec();
    const paginatedAnswers = result[0].data;
    const total = result[0].totalItems[0]?.count || 0;

    // Transform data
    const reports: ReportData[] = paginatedAnswers.map(answer => ({
      _id: (answer._id as any).toString(),
      namaSiswa: answer.user?.namaLengkap || answer.user?.username || 'Unknown', // Prioritas namaLengkap, fallback ke username
      kelas: answer.user?.kelas || 'Unknown',
      nipNim: answer.user?.nipNim || '-',
      kodeSoal: answer.kode_soal,
      judulUjian: answer.soal?.judul || 'Unknown', // Menggunakan judul sesuai schema soal
      nilai: typeof answer.percentage === 'number' ? answer.percentage : 0,
      durasi: answer.soal?.durasi || 0,
      minimalNilai: answer.minimalNilai || 70,
      tanggal: answer.createdAt || new Date(),
      status: answer.isLulus ? 'Lulus' : 'Tidak Lulus',
      detailJawaban: this.buildDetailJawaban(answer, answer.soal),
    }));

    return {
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportById(id: string): Promise<ReportData> {
    const answer = await this.answerModel
      .findById(id)
      .populate('user_id')
      .populate('soal_id')
      .exec();

    if (!answer) {
      throw new NotFoundException('Report tidak ditemukan');
    }

    return {
      _id: (answer._id as any).toString(),
      namaSiswa: (answer.user_id as any)?.namaLengkap || (answer.user_id as any)?.username || 'Unknown',
      kelas: (answer.user_id as any)?.kelas || 'Unknown',
      nipNim: (answer.user_id as any)?.nipNim || '-',
      kodeSoal: answer.kode_soal,
      judulUjian: (answer.soal_id as any)?.judul || 'Unknown',
      nilai: typeof answer.percentage === 'number' ? answer.percentage : 0,
      durasi: (answer.soal_id as any)?.durasi || 0,
      minimalNilai: answer.minimalNilai || 70,
      tanggal: (answer as any).createdAt || new Date(),
      status: answer.isLulus ? 'Lulus' : 'Tidak Lulus',
      detailJawaban: this.buildDetailJawaban(answer, answer.soal_id as any), // Cast to any for populated field
    };
  }

  async deleteReport(id: string): Promise<void> {
    // First, get the answer to check user and soal info
    const answer = await this.answerModel
      .findById(id)
      .populate('user_id', 'username namaLengkap')
      .populate('soal_id', 'kode judul')
      .exec();

    if (!answer) {
      throw new NotFoundException('Report tidak ditemukan');
    }

    // Delete the specific answer (this is safe - only deletes one answer record)
    const result = await this.answerModel.findByIdAndDelete(id);
    
    if (!result) {
      throw new NotFoundException('Gagal menghapus report');
    }

    // Return info about what was deleted
    return {
      deleted_answer_id: id,
      user_info: {
        user_id: answer.user_id ? (answer.user_id as any)._id : null,
        username: (answer.user_id as any)?.username || 'Unknown',
        namaLengkap: (answer.user_id as any)?.namaLengkap || 'Unknown'
      },
      soal_info: {
        soal_id: answer.soal_id ? (answer.soal_id as any)._id : null,
        kode: (answer.soal_id as any)?.kode || 'Unknown',
        judul: (answer.soal_id as any)?.judul || 'Unknown'
      },
      note: 'Hanya menghapus 1 answer record specific ini, tidak menghapus answer lain dari user yang sama'
    } as any;
  }

  async deleteReportsByUserAndSoal(userId: string, soalKode: string): Promise<any> {
    // Find answers to be deleted
    const answersToDelete = await this.answerModel
      .find({ 
        user_id: userId, 
        kode_soal: soalKode 
      })
      .populate('user_id', 'username namaLengkap')
      .exec();

    if (answersToDelete.length === 0) {
      throw new NotFoundException('Tidak ada answer yang ditemukan untuk user dan soal tersebut');
    }

    // Delete all answers for this user and soal
    const deleteResult = await this.answerModel.deleteMany({ 
      user_id: userId, 
      kode_soal: soalKode 
    });

    return {
      deleted_count: deleteResult.deletedCount,
      user_info: {
        user_id: userId,
        username: (answersToDelete[0].user_id as any)?.username || 'Unknown',
        namaLengkap: (answersToDelete[0].user_id as any)?.namaLengkap || 'Unknown'
      },
      soal_kode: soalKode,
      deleted_answer_ids: answersToDelete.map(answer => answer._id),
      note: `Menghapus semua ${deleteResult.deletedCount} answer dari user ${userId} untuk soal ${soalKode}`
    };
  }

  async verifyAnswerExists(answerId: string): Promise<any> {
    const answer = await this.answerModel
      .findById(answerId)
      .populate('user_id', 'username namaLengkap kelas role')
      .populate('soal_id', 'kode judul')
      .exec();

    if (!answer) {
      throw new NotFoundException('Answer/Report tidak ditemukan');
    }

    return {
      answer_id: answerId,
      report_id: answerId, // Same as answer_id - proves no separate collection
      answer_exists: true,
      user_data: {
        exists: !!answer.user_id,
        username: (answer.user_id as any)?.username,
        namaLengkap: (answer.user_id as any)?.namaLengkap,
        kelas: (answer.user_id as any)?.kelas,
      },
      soal_data: {
        exists: !!answer.soal_id,
        kode: (answer.soal_id as any)?.kode,
        judul: (answer.soal_id as any)?.judul,
      },
      answer_metadata: {
        kode_soal: answer.kode_soal,
        percentage: answer.percentage,
        isLulus: answer.isLulus,
        created_at: (answer as any).createdAt,
      },
      collections_used: {
        primary: 'answers',
        populated: ['users', 'soals'],
        reports_collection: 'NOT EXISTS - Virtual entity'
      }
    };
  }

  async getReportSummary() {
    const total = await this.answerModel.countDocuments();
    const totalLulus = await this.answerModel.countDocuments({ isLulus: true });
    const totalTidakLulus = await this.answerModel.countDocuments({ isLulus: false });

    // Get kelas summary
    const kelasSummary = await this.answerModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.kelas',
          total: { $sum: 1 },
          lulus: { $sum: { $cond: ['$isLulus', 1, 0] } },
          avgNilai: { $avg: '$percentage' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return {
      totalReports: total,
      totalLulus: totalLulus,
      totalTidakLulus: totalTidakLulus,
      persentaseLulus: total > 0 ? Math.round((totalLulus / total) * 100) : 0,
      summaryPerKelas: kelasSummary.map(item => ({
        kelas: item._id,
        totalSiswa: item.total,
        totalLulus: item.lulus,
        totalTidakLulus: item.total - item.lulus,
        persentaseLulus: Math.round((item.lulus / item.total) * 100),
        rataRataNilai: Math.round(item.avgNilai)
      }))
    };
  }

  private buildDetailJawaban(answer: any, soal: any): ReportData['detailJawaban'] {
    if (!answer.detailed_results || !soal?.soal) {
      return [];
    }

    return answer.detailed_results.map((detail, index) => {
      const soalItem = soal.soal[index];
      if (!soalItem) {
        // Fallback jika soalItem tidak ditemukan
        const nomorSoal = detail.nomor ? detail.nomor.toString() : (index + 1).toString();
        let jawabanUserFallback = detail.jawaban_user;
        
        // Fallback ke answer.jawaban jika jawaban_user tidak ada atau kosong
        if (!jawabanUserFallback || (typeof jawabanUserFallback === 'string' && jawabanUserFallback.trim() === '')) {
          if (answer.jawaban && typeof answer.jawaban === 'object') {
            if (answer.jawaban[nomorSoal]) {
              jawabanUserFallback = answer.jawaban[nomorSoal];
            } else {
              const fallbackNomor = (index + 1).toString();
              jawabanUserFallback = answer.jawaban[fallbackNomor] || '';
            }
          } else {
            jawabanUserFallback = '';
          }
        }
        
        return {
          pertanyaan: `Soal ${index + 1}`,
          jawabanSiswa: jawabanUserFallback,
          jawabanBenar: null,
          skor: detail.score || 0,
          feedback: detail.feedback || '',
          isCorrect: detail.isCorrect !== undefined ? detail.isCorrect : false,
        };
      }

      // Ambil jawaban user dari detailed_results, dengan fallback ke answer.jawaban (untuk data lama)
      // Gunakan nomor dari detail jika ada, otherwise gunakan index + 1
      const nomorSoal = detail.nomor ? detail.nomor.toString() : (index + 1).toString();
      let jawabanUser = detail.jawaban_user;
      
      // Fallback: jika jawaban_user tidak ada atau kosong, ambil dari answer.jawaban[nomorSoal]
      // Ini penting untuk backward compatibility dengan data lama yang tidak punya jawaban_user
      if (!jawabanUser || (typeof jawabanUser === 'string' && jawabanUser.trim() === '')) {
        if (answer.jawaban && typeof answer.jawaban === 'object') {
          // Coba dengan nomorSoal terlebih dahulu
          if (answer.jawaban[nomorSoal]) {
            jawabanUser = answer.jawaban[nomorSoal];
          } else {
            // Fallback: coba dengan index + 1 jika nomorSoal tidak cocok
            const fallbackNomor = (index + 1).toString();
            if (answer.jawaban[fallbackNomor]) {
              jawabanUser = answer.jawaban[fallbackNomor];
            } else {
              jawabanUser = '';
            }
          }
        } else {
          jawabanUser = '';
        }
      }
      
      // Tentukan jawaban benar berdasarkan tipe soal
      let jawabanBenar = null;
      const questionType = (soalItem.type || '').toLowerCase();
      
      // Check for pilihan ganda (with or without space, with or without underscore)
      if (questionType.includes('pilihan')) {
        // Prioritas: jawaban_benar > jawaban (backward compatibility)
        jawabanBenar = soalItem.jawaban_benar || soalItem.jawaban || null;
      } else if (questionType.includes('essay') || questionType.includes('esai')) {
        // Untuk essay, gunakan kunci_jawaban jika ada, atau jawaban sebagai fallback
        jawabanBenar = soalItem.kunci_jawaban || soalItem.jawaban || null;
      } else {
        // Untuk tipe lain (isian, dll), gunakan jawaban jika ada
        jawabanBenar = soalItem.jawaban_benar || soalItem.jawaban || null;
      }
      
      return {
        pertanyaan: soalItem.soal || `Soal ${index + 1}`,
        jawabanSiswa: jawabanUser,
        jawabanBenar: jawabanBenar,
        skor: detail.score || 0,
        feedback: detail.feedback || '',
        isCorrect: detail.isCorrect !== undefined ? detail.isCorrect : (detail.score === 100),
      };
    });
  }
}