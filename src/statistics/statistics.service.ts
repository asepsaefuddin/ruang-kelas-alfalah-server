import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Soal, SoalDocument } from '../soals/schemas/soal.schema';
import { Answer, AnswerDocument } from '../answers/schemas/answer.schema';

export interface UserStatistics {
  totalUsers: number;
  totalGuru: number;
  totalSiswa: number;
  totalAdmin: number;
  usersByStatus: {
    aktif: number;
    tidakAktif: number;
  };
}

export interface StudentPerformance {
  totalStudents: number;
  studentsWithScores: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  performanceByClass: {
    kelas: string;
    totalStudents: number;
    averageScore: number;
    passRate: number;
  }[];
}

export interface ActivityStatistics {
  userRegistrations: {
    date: string;
    count: number;
    role: string;
  }[];
  soalCreations: {
    date: string;
    count: number;
    averageMinimalNilai: number;
  }[];
  answerSubmissions: {
    date: string;
    count: number;
    averageScore: number;
    passRate: number;
  }[];
}

export interface OverallStatistics {
  userStats: UserStatistics;
  studentPerformance: StudentPerformance;
  activityStats: ActivityStatistics;
  generatedAt: Date;
}

export interface AISummary {
  summary: string;
  trend: 'kemajuan' | 'kemunduran' | 'stabil';
  keyInsights: string[];
  generatedAt: Date;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Soal.name) private soalModel: Model<SoalDocument>,
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  async getUserStatistics(): Promise<UserStatistics> {
    const [totalUsers, usersByRole, usersByStatus] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      this.userModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const statusStats = usersByStatus.reduce((acc, item) => {
      acc[item._id === 'aktif' ? 'aktif' : 'tidakAktif'] = item.count;
      return acc;
    }, { aktif: 0, tidakAktif: 0 });

    return {
      totalUsers,
      totalGuru: roleStats['guru'] || 0,
      totalSiswa: roleStats['siswa'] || 0,
      totalAdmin: roleStats['admin'] || 0,
      usersByStatus: statusStats
    };
  }

  async getStudentPerformance(): Promise<StudentPerformance> {
    // Get all students
    const totalStudents = await this.userModel.countDocuments({ role: 'siswa' });

    // Get answer statistics
    const [scoreStats, performanceByClass] = await Promise.all([
      this.answerModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            'user.role': 'siswa'
          }
        },
        {
          $group: {
            _id: null,
            studentsWithScores: { $addToSet: '$user_id' },
            averageScore: { $avg: '$percentage' },
            highestScore: { $max: '$percentage' },
            lowestScore: { $min: '$percentage' },
            totalPassed: {
              $sum: {
                $cond: ['$isLulus', 1, 0]
              }
            },
            totalAnswers: { $sum: 1 }
          }
        }
      ]),
      this.answerModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            'user.role': 'siswa'
          }
        },
        {
          $group: {
            _id: '$user.kelas',
            students: { $addToSet: '$user_id' },
            averageScore: { $avg: '$percentage' },
            totalPassed: {
              $sum: {
                $cond: ['$isLulus', 1, 0]
              }
            },
            totalAnswers: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])
    ]);

    const stats = scoreStats[0] || {
      studentsWithScores: [],
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalPassed: 0,
      totalAnswers: 0
    };

    return {
      totalStudents,
      studentsWithScores: stats.studentsWithScores.length,
      averageScore: Math.round(stats.averageScore * 100) / 100 || 0,
      highestScore: stats.highestScore || 0,
      lowestScore: stats.lowestScore || 0,
      passRate: stats.totalAnswers > 0 ? Math.round((stats.totalPassed / stats.totalAnswers) * 100) : 0,
      performanceByClass: performanceByClass.map(item => ({
        kelas: item._id || 'Unknown',
        totalStudents: item.students.length,
        averageScore: Math.round(item.averageScore * 100) / 100 || 0,
        passRate: item.totalAnswers > 0 ? Math.round((item.totalPassed / item.totalAnswers) * 100) : 0
      }))
    };
  }

  async getActivityStatistics(days: number = 30): Promise<ActivityStatistics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [userRegistrations, soalCreations, answerSubmissions] = await Promise.all([
      // User registrations by date and role
      this.userModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),
      // Soal creations by date
      this.soalModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 },
            averageMinimalNilai: { $avg: '$minimalNilai' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]),
      // Answer submissions by date
      this.answerModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 },
            averageScore: { $avg: '$percentage' },
            totalPassed: {
              $sum: {
                $cond: ['$isLulus', 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])
    ]);

    return {
      userRegistrations: userRegistrations.map(item => ({
        date: item._id.date,
        count: item.count,
        role: item._id.role
      })),
      soalCreations: soalCreations.map(item => ({
        date: item._id,
        count: item.count,
        averageMinimalNilai: Math.round(item.averageMinimalNilai * 100) / 100 || 0
      })),
      answerSubmissions: answerSubmissions.map(item => ({
        date: item._id,
        count: item.count,
        averageScore: Math.round(item.averageScore * 100) / 100 || 0,
        passRate: item.count > 0 ? Math.round((item.totalPassed / item.count) * 100) : 0
      }))
    };
  }

  async getOverallStatistics(activityDays: number = 30): Promise<OverallStatistics> {
    const [userStats, studentPerformance, activityStats] = await Promise.all([
      this.getUserStatistics(),
      this.getStudentPerformance(),
      this.getActivityStatistics(activityDays)
    ]);

    return {
      userStats,
      studentPerformance,
      activityStats,
      generatedAt: new Date()
    };
  }

  async getQuickStats(): Promise<any> {
    const [userStats, answersCount, soalsCount, recentActivity] = await Promise.all([
      this.getUserStatistics(),
      this.answerModel.countDocuments(),
      this.soalModel.countDocuments(),
      this.getActivityStatistics(7) // Last 7 days
    ]);

    return {
      summary: {
        totalUsers: userStats.totalUsers,
        totalGuru: userStats.totalGuru,
        totalSiswa: userStats.totalSiswa,
        totalSoals: soalsCount,
        totalAnswers: answersCount
      },
      recentActivity: {
        last7Days: {
          userRegistrations: recentActivity.userRegistrations.reduce((sum, item) => sum + item.count, 0),
          soalCreations: recentActivity.soalCreations.reduce((sum, item) => sum + item.count, 0),
          answerSubmissions: recentActivity.answerSubmissions.reduce((sum, item) => sum + item.count, 0)
        }
      }
    };
  }

  async getStudentSelfStatistics(userId: string): Promise<{
    totalSoal: number;
    soalSelesai: number;
    rataRataNilai: number;
    totalNilai: number;
    riwayat: Array<{
      answerId: string;
      kodeSoal: string;
      judulUjian: string;
      nilai: number;
      isLulus: boolean;
      tanggal: Date;
    }>;
  }> {
    // Hitung statistik inti
    const [counts, recentAnswers] = await Promise.all([
      this.answerModel.aggregate([
        { $match: { user_id: new (this.answerModel as any).db.base.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalNilai: { $sum: { $ifNull: ['$percentage', 0] } },
            selesai: { $sum: 1 },
            // selesai: gunakan 1 karena setiap dokumen answer adalah submission selesai
          }
        }
      ]),
      this.answerModel
        .find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('soal_id', 'judul')
        .lean()
        .exec()
    ]);

    const agg = counts[0] || { total: 0, totalNilai: 0, selesai: 0 };
    const totalSoal = agg.total || 0;
    const soalSelesai = agg.selesai || 0;
    const rataRataNilai = totalSoal > 0 ? Math.round((agg.totalNilai / totalSoal) as number) : 0;

    const riwayat = recentAnswers.map((ans: any) => ({
      answerId: (ans._id as any).toString(),
      kodeSoal: ans.kode_soal,
      judulUjian: (ans.soal_id as any)?.judul || 'Unknown',
      nilai: typeof ans.percentage === 'number' ? ans.percentage : 0,
      isLulus: !!ans.isLulus,
      tanggal: (ans as any).createdAt || new Date(),
    }));

    return {
      totalSoal,
      soalSelesai,
      rataRataNilai,
      totalNilai: agg.totalNilai || 0,
      riwayat,
    };
  }

  async getAISummary(): Promise<AISummary> {
    try {
      // Kumpulkan data statistik 30 hari terakhir
      const [userStats, performance, activity] = await Promise.all([
        this.getUserStatistics(),
        this.getStudentPerformance(),
        this.getActivityStatistics(30)
      ]);

      // Hitung trend berdasarkan data 30 hari vs 60 hari terakhir
      const [activity60Days] = await Promise.all([
        this.getActivityStatistics(60)
      ]);

      // Bandingkan performa 30 hari pertama vs 30 hari terakhir
      const recent30DaysActivity = activity.answerSubmissions.slice(0, 30);
      const previous30DaysActivity = activity60Days.answerSubmissions.slice(30, 60);

      const recentAvgScore = recent30DaysActivity.length > 0 
        ? recent30DaysActivity.reduce((sum, day) => sum + day.averageScore, 0) / recent30DaysActivity.length 
        : 0;
      
      const previousAvgScore = previous30DaysActivity.length > 0 
        ? previous30DaysActivity.reduce((sum, day) => sum + day.averageScore, 0) / previous30DaysActivity.length 
        : 0;

      const recentPassRate = recent30DaysActivity.length > 0 
        ? recent30DaysActivity.reduce((sum, day) => sum + day.passRate, 0) / recent30DaysActivity.length 
        : 0;

      const previousPassRate = previous30DaysActivity.length > 0 
        ? previous30DaysActivity.reduce((sum, day) => sum + day.passRate, 0) / previous30DaysActivity.length 
        : 0;

      // Tentukan trend
      let trend: 'kemajuan' | 'kemunduran' | 'stabil' = 'stabil';
      const scoreDiff = recentAvgScore - previousAvgScore;
      const passRateDiff = recentPassRate - previousPassRate;

      if (scoreDiff > 2 && passRateDiff > 5) {
        trend = 'kemajuan';
      } else if (scoreDiff < -2 && passRateDiff < -5) {
        trend = 'kemunduran';
      }

      // Buat data untuk AI
      const statsData = {
        totalSiswa: userStats.totalSiswa,
        totalGuru: userStats.totalGuru,
        averageScore: performance.averageScore,
        passRate: performance.passRate,
        recentAvgScore,
        previousAvgScore,
        recentPassRate,
        previousPassRate,
        totalSoals: activity.soalCreations.reduce((sum, day) => sum + day.count, 0),
        totalAnswers: activity.answerSubmissions.reduce((sum, day) => sum + day.count, 0),
        trend
      };

      // Generate AI Summary
      const aiSummary = await this.generateAISummary(statsData);

      return {
        summary: aiSummary.summary,
        trend,
        keyInsights: aiSummary.insights,
        generatedAt: new Date()
      };

    } catch (error) {
      // Fallback jika AI gagal
      const performance = await this.getStudentPerformance();
      const fallbackTrend = performance.averageScore >= 75 ? 'kemajuan' : 
                           performance.averageScore >= 60 ? 'stabil' : 'kemunduran';
      
      return {
        summary: `Platform menunjukkan ${fallbackTrend} dengan rata-rata nilai ${performance.averageScore.toFixed(1)} dan tingkat kelulusan ${performance.passRate.toFixed(1)}% dari ${performance.totalStudents} siswa aktif.`,
        trend: fallbackTrend,
        keyInsights: [
          `${performance.totalStudents} siswa terdaftar dengan tingkat kelulusan ${performance.passRate.toFixed(1)}%`,
          `Rata-rata nilai keseluruhan: ${performance.averageScore.toFixed(1)}`,
          `Performa tertinggi: ${performance.highestScore}, terendah: ${performance.lowestScore}`
        ],
        generatedAt: new Date()
      };
    }
  }

  private async generateAISummary(data: any): Promise<{ summary: string; insights: string[] }> {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fallback');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Sebagai analis pendidikan profesional, berikan ringkasan satu kalimat yang komprehensif tentang data statistik platform pembelajaran berikut:

Data Statistik:
- Total Siswa: ${data.totalSiswa}
- Total Guru: ${data.totalGuru}
- Rata-rata Nilai Keseluruhan: ${data.averageScore.toFixed(1)}
- Tingkat Kelulusan: ${data.passRate.toFixed(1)}%
- Rata-rata Nilai 30 Hari Terakhir: ${data.recentAvgScore.toFixed(1)}
- Rata-rata Nilai 30 Hari Sebelumnya: ${data.previousAvgScore.toFixed(1)}
- Tingkat Kelulusan 30 Hari Terakhir: ${data.recentPassRate.toFixed(1)}%
- Tingkat Kelulusan 30 Hari Sebelumnya: ${data.previousPassRate.toFixed(1)}%
- Total Soal Dibuat: ${data.totalSoals}
- Total Jawaban Dikumpulkan: ${data.totalAnswers}
- Trend: ${data.trend}

Instruksi:
1. Berikan HANYA SATU kalimat ringkasan yang profesional dan informatif
2. Sertakan angka-angka penting dan trend
3. Gunakan bahasa Indonesia formal
4. Fokus pada kemajuan/kemunduran performa siswa
5. Maksimal 150 karakter

Format respons:
SUMMARY: [kalimat ringkasan]
INSIGHT1: [insight singkat 1]
INSIGHT2: [insight singkat 2]
INSIGHT3: [insight singkat 3]
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse response
      const lines = response.split('\n').filter(line => line.trim());
      const summary = lines.find(line => line.startsWith('SUMMARY:'))?.replace('SUMMARY:', '').trim() 
        || `Platform menunjukkan ${data.trend} dengan rata-rata nilai ${data.averageScore.toFixed(1)} dan tingkat kelulusan ${data.passRate.toFixed(1)}%.`;
      
      const insights = lines
        .filter(line => line.startsWith('INSIGHT'))
        .map(line => line.replace(/INSIGHT\d+:/, '').trim())
        .slice(0, 3);

      if (insights.length === 0) {
        insights.push(
          `${data.totalSiswa} siswa aktif dengan ${data.totalGuru} guru`,
          `Tingkat kelulusan mencapai ${data.passRate.toFixed(1)}%`,
          `Trend ${data.trend} berdasarkan perbandingan 30 hari terakhir`
        );
      }

      return { summary, insights };

    } catch (error) {
      // Fallback jika AI gagal
      return {
        summary: `Platform menunjukkan ${data.trend} dengan rata-rata nilai ${data.averageScore.toFixed(1)} dan tingkat kelulusan ${data.passRate.toFixed(1)}% dari ${data.totalSiswa} siswa.`,
        insights: [
          `${data.totalSiswa} siswa terdaftar dengan ${data.totalGuru} guru aktif`,
          `Performa siswa ${data.trend === 'kemajuan' ? 'meningkat' : data.trend === 'kemunduran' ? 'menurun' : 'stabil'} dalam 30 hari terakhir`,
          `Total ${data.totalSoals} soal telah dibuat dengan ${data.totalAnswers} jawaban terkumpul`
        ]
      };
    }
  }
}