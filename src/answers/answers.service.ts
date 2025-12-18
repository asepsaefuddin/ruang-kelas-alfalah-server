import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { SoalsService } from '../soals/soals.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    private soalsService: SoalsService,
    private geminiService: GeminiService,
  ) {}

  async getSoalByKode(kode: string) {
    const soal = await this.soalsService.findByKode(kode);
    
    // Format response untuk tampilkan soal tanpa jawaban yang benar
    const formattedSoal = {
      _id: (soal as any)._id,
      kode: soal.kode,
      judul: soal.judul,
      minimalNilai: soal.minimalNilai,
      soal: soal.soal.map((item, index) => {
        const questionData: any = {
          nomor: index + 1,
          type: item.type,
          soal: item.soal,
        };
        
        // Hanya tambahkan list_jawaban untuk pilihan ganda
        if (item.type === 'pilihan ganda' || item.type === 'pilihan ganda + image') {
          questionData.list_jawaban = item.list_jawaban;
        }
        
        // Hanya tambahkan gambar jika benar-benar ada dan bukan string kosong
        if (item.gambar && item.gambar.trim() !== '' && item.gambar !== 'null' && item.gambar !== 'undefined') {
          questionData.gambar = item.gambar;
        }
        
        return questionData;
      }),
    };

    return {
      success: true,
      message: 'Soal berhasil diambil',
      data: formattedSoal,
      format_jawaban: {
        description: 'Format untuk menjawab soal',
        example: {
          "1": "a", // untuk pilihan ganda
          "2": "b", 
          "3": "ini jawaban essay" // untuk essay
        }
      }
    };
  }

  async submitAnswer(kode: string, createAnswerDto: CreateAnswerDto) {
    // Ambil soal berdasarkan kode
    const soal = await this.soalsService.findByKode(kode);
    
    // Debug: log soal data
    console.log('🎯 Debug - Soal data:', {
      kode: soal.kode,
      minimalNilai: soal.minimalNilai,
      soalLength: soal.soal.length,
      soalItems: soal.soal.map((item, idx) => ({
        index: idx,
        type: item.type,
        hasJawaban: !!item.jawaban,
        jawaban: item.jawaban,
        listJawabanLength: item.list_jawaban?.length || 0
      }))
    });

    console.log('📝 Debug - User submission:', {
      userAnswers: createAnswerDto.jawaban,
      userId: createAnswerDto.user_id
    });

    // Hitung score dan kumpulkan feedback
    let totalScore = 0;
    let correctAnswers = 0;
    const { jawaban } = createAnswerDto;
    const essayFeedbacks: string[] = [];
    const detailedResults: any[] = [];
    
    // Process each question
    for (let index = 0; index < soal.soal.length; index++) {
      const item = soal.soal[index];
      const nomorSoal = (index + 1).toString();
      const jawabanUser = jawaban[nomorSoal];
      
      console.log(`🔍 Processing question ${nomorSoal}:`, {
        questionType: item.type,
        userAnswer: jawabanUser,
        correctAnswer: item.jawaban,
        hasUserAnswer: !!jawabanUser,
        hasCorrectAnswer: !!item.jawaban
      });
      
      if (item.type.includes('pilihan ganda') && jawabanUser) {
        // Pilihan ganda scoring
        console.log('🔍 PG Question Debug:', {
          nomorSoal,
          questionType: item.type,
          userAnswer: jawabanUser,
          correctAnswer: item.jawaban,
          listJawaban: item.list_jawaban
        });
        
        const isCorrect = item.jawaban && jawabanUser.toLowerCase() === item.jawaban.toLowerCase();
        const score = isCorrect ? 100 : 0;
        totalScore += score;
        if (isCorrect) correctAnswers++;
        
        console.log('✅ PG Score:', { isCorrect, score, totalScore });
        
        detailedResults.push({
          nomor: index + 1,
          type: 'pilihan ganda',
          jawaban_user: jawabanUser || '',
          score: score,
          isCorrect: isCorrect,
          feedback: isCorrect ? 'Jawaban benar!' : `Jawaban salah, yang benar adalah: ${item.jawaban}`
        });
        
      } else if (item.type.includes('essay') && jawabanUser && item.jawaban) {
        // Essay scoring with AI
        console.log('📝 Essay Question Debug:', {
          nomorSoal,
          questionType: item.type,
          userAnswer: jawabanUser,
          correctAnswer: item.jawaban
        });
        
        const aiResult = await this.geminiService.checkEssayAnswer(
          item.soal,
          item.jawaban,
          jawabanUser
        );
        
        console.log('🤖 AI Score:', aiResult);
        
        totalScore += aiResult.score;
        if (aiResult.isCorrect) correctAnswers++;
        essayFeedbacks.push(aiResult.feedback);
        
        detailedResults.push({
          nomor: index + 1,
          type: 'essay',
          jawaban_user: jawabanUser || '',
          score: aiResult.score,
          isCorrect: aiResult.isCorrect,
          feedback: aiResult.feedback
        });
      } else {
        // Handle unanswered questions or unsupported types
        console.log('⚠️ Question not processed:', {
          nomorSoal,
          questionType: item.type,
          hasUserAnswer: !!jawabanUser,
          hasCorrectAnswer: !!item.jawaban,
          userAnswer: jawabanUser
        });
        
        // Still add to detailedResults for consistency
        detailedResults.push({
          nomor: index + 1,
          type: item.type || 'unknown',
          jawaban_user: jawabanUser || '',
          score: 0,
          isCorrect: false,
          feedback: jawabanUser ? 'Jawaban tidak dapat dinilai' : 'Tidak dijawab'
        });
      }
    }

    // Generate overall feedback
    const overallFeedback = await this.geminiService.generateOverallFeedback(
      totalScore,
      soal.soal.length,
      correctAnswers,
      essayFeedbacks
    );

    // Hitung persentase dan status kelulusan
    const maxScore = soal.soal.length * 100;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Pastikan minimalNilai terdefinisi, default 75 jika tidak ada
    const minimalNilai = soal.minimalNilai !== undefined && soal.minimalNilai !== null ? soal.minimalNilai : 75;
    const isLulus = percentage >= minimalNilai;
    
    // Debug: log scoring calculation
    console.log('Debug - Scoring:', {
      totalScore,
      maxScore,
      percentage,
      minimalNilai,
      isLulus
    });

    // Simpan jawaban
    const newAnswer = new this.answerModel({
      kode_soal: kode,
      soal_id: new Types.ObjectId((soal as any)._id.toString()),
      user_id: createAnswerDto.user_id ? new Types.ObjectId(createAnswerDto.user_id) : undefined,
      jawaban: jawaban,
      score: Math.round(totalScore),
      percentage: percentage,
      minimalNilai: minimalNilai,
      isLulus: isLulus,
      status: 'graded', // Semua sudah dinilai dengan AI
      feedback: overallFeedback,
      detailed_results: detailedResults,
    });

    const savedAnswer = await newAnswer.save();

    return {
      success: true,
      message: 'Jawaban berhasil disimpan dan dinilai',
      data: {
        answer_id: savedAnswer._id,
        kode_soal: kode,
        nilai: percentage, // Frontend expects 'nilai' field
        total_score: Math.round(totalScore),
        max_score: maxScore,
        percentage: percentage,
        minimalNilai: minimalNilai, // Frontend expects this field
        is_lulus: isLulus,
        status_kelulusan: isLulus ? 'LULUS' : 'TIDAK LULUS',
        correct_answers: correctAnswers,
        total_questions: soal.soal.length,
        status: savedAnswer.status,
        overall_feedback: overallFeedback,
        detailed_results: detailedResults,
        jawaban: jawaban,
        keterangan: {
          minimal_untuk_lulus: `${minimalNilai}%`,
          nilai_anda: `${percentage}%`,
          selisih: isLulus ? `+${percentage - minimalNilai}% (di atas minimum)` : `${percentage - minimalNilai}% (di bawah minimum)`,
          feedback_ai: overallFeedback,
          saran: overallFeedback, // Frontend expects this for AI feedback display
          status_akademik: isLulus ? "LULUS" : "PERLU REMEDIAL"
        }
      },
    };
  }

  async findAll(
    page: number,
    limit: number,
    isLulus?: boolean,
  ): Promise<{ 
    data: Answer[]; 
    count: number; 
    total: number; 
    page: number; 
    limit: number;
    summary: any;
  }> {
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};
    if (isLulus !== undefined) {
      filter.isLulus = isLulus;
    }

    const [data, total] = await Promise.all([
      this.answerModel
        .find(filter)
        .populate('soal_id', 'kode judul minimalNilai') // Pilih field yang relevan
        .populate('user_id', 'username role kelas mataPelajaran') // Pilih field yang relevan
        .skip(skip).limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.answerModel.countDocuments(filter),
    ]);

    // Summary statistics
    const summary = await this.getAnswersSummary();

    return { data, count: data.length, total, page, limit, summary };
  }

  async getAnswersSummary() {
    const [totalAnswers, lulusCount, tidakLulusCount, avgPercentage] = await Promise.all([
      this.answerModel.countDocuments(),
      this.answerModel.countDocuments({ isLulus: true }),
      this.answerModel.countDocuments({ isLulus: false }),
      this.answerModel.aggregate([
        { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
      ])
    ]);

    return {
      total_answers: totalAnswers,
      lulus: lulusCount,
      tidak_lulus: tidakLulusCount,
      persentase_kelulusan: totalAnswers > 0 ? Math.round((lulusCount / totalAnswers) * 100) : 0,
      rata_rata_nilai: avgPercentage.length > 0 ? Math.round(avgPercentage[0].avgPercentage) : 0
    };
  }

  async findByKode(kode: string): Promise<Answer[]> {
    return await this.answerModel
      .find({ kode_soal: kode })
      .populate('soal_id')
      .populate('user_id')
      .exec();
  }
}