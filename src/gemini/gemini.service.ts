import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
  }

  async checkEssayAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<{
    score: number;
    feedback: string;
    isCorrect: boolean;
  }> {
    // Try AI first, fallback to manual scoring
    try {
      const prompt = `
Sebagai AI penilai, evaluasi jawaban essay berikut dan berikan response dalam format JSON yang valid:

PERTANYAAN: ${question}
JAWABAN YANG BENAR: ${correctAnswer}
JAWABAN SISWA: ${userAnswer}

Berikan penilaian dalam format JSON ini:
{
  "score": 85,
  "feedback": "feedback dalam 1 kalimat singkat dan konstruktif",
  "isCorrect": true
}

Kriteria penilaian:
- Kesesuaian dengan jawaban yang benar (40%)
- Kelengkapan informasi (30%)
- Kejelasan penjelasan (20%)
- Tata bahasa dan struktur (10%)

Score range: 0-100. Threshold benar: >= 70.
Berikan feedback yang membantu dan motivasi untuk siswa.
Response harus JSON valid tanpa markdown formatting.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Remove markdown formatting if exists
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Parse JSON response
      try {
        const parsed = JSON.parse(text);
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          feedback: parsed.feedback || "Jawaban sudah cukup baik.",
          isCorrect: parsed.score >= 70
        };
      } catch (parseError) {
        throw new Error('JSON parsing failed');
      }
      
    } catch (error) {
      console.log('AI grading failed, using fallback scoring');
      
      // Fallback: Advanced manual scoring
      const userAnswerLower = userAnswer.toLowerCase();
      const correctAnswerLower = correctAnswer.toLowerCase();
      
      // Word count analysis
      const wordCount = userAnswer.split(' ').length;
      const minWords = 5;
      const optimalWords = 20;
      
      // Keyword matching
      const correctWords = correctAnswerLower.split(' ').filter(word => word.length > 3);
      const userWords = userAnswerLower.split(' ');
      const matchingKeywords = correctWords.filter(word => userWords.includes(word));
      const keywordScore = (matchingKeywords.length / correctWords.length) * 100;
      
      // Length score
      let lengthScore = 0;
      if (wordCount >= minWords) {
        lengthScore = Math.min(100, (wordCount / optimalWords) * 100);
      }
      
      // Content relevance (keyword matching)
      const relevanceScore = keywordScore;
      
      // Final score calculation
      const finalScore = Math.round(
        (lengthScore * 0.3) + 
        (relevanceScore * 0.6) + 
        (wordCount >= minWords ? 10 : 0) // Completion bonus
      );
      
      // Generate feedback based on score
      let feedback = "";
      if (finalScore >= 80) {
        feedback = "Jawaban sangat baik dan lengkap, pertahankan kualitas ini!";
      } else if (finalScore >= 60) {
        feedback = "Jawaban cukup baik, namun bisa lebih detail dan lengkap lagi.";
      } else if (finalScore >= 40) {
        feedback = "Jawaban kurang lengkap, perlu penjelasan yang lebih mendalam.";
      } else {
        feedback = "Jawaban terlalu singkat, mohon berikan penjelasan yang lebih detail.";
      }
      
      return {
        score: Math.min(100, Math.max(0, finalScore)),
        feedback: feedback,
        isCorrect: finalScore >= 70
      };
    }
  }

  async generateMotivation(): Promise<string> {
    try {
      const prompt = `
Buatkan 1 kalimat motivasi singkat dan inspiratif untuk siswa yang sedang belajar.
Fokus pada semangat belajar, pantang menyerah, dan pencapaian prestasi.
Maksimal 15 kata.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().replace(/"/g, '');
    } catch (error) {
      console.log('AI motivation failed, using fallback');
      // Fallback: Random motivational quotes
      const motivations = [
        "Terus belajar dan jangan pernah menyerah, kesuksesan menanti di depan!",
        "Setiap usaha keras akan membuahkan hasil yang manis!",
        "Belajar hari ini untuk masa depan yang lebih cerah!",
        "Kegagalan adalah guru terbaik untuk menuju kesuksesan!",
        "Mimpi besar dimulai dari langkah kecil hari ini!",
        "Ilmu adalah harta yang tak akan pernah hilang!",
        "Rajin belajar, rajin berlatih, sukses pasti datang!",
        "Jangan takut salah, yang penting terus belajar!",
        "Hari ini lebih baik dari kemarin, besok lebih baik dari hari ini!",
        "Semangat belajar adalah kunci membuka pintu kesuksesan!"
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }
  }

  async generateOverallFeedback(
    totalScore: number,
    totalQuestions: number,
    correctAnswers: number,
    essayFeedbacks: string[]
  ): Promise<string> {
    const percentage = (totalScore / (totalQuestions * 100)) * 100;
    
    try {
      const prompt = `
Berikan feedback keseluruhan untuk siswa dalam 1 kalimat yang memotivasi berdasarkan:
- Total skor: ${totalScore} dari ${totalQuestions * 100} poin
- Persentase: ${percentage.toFixed(1)}%
- Jawaban benar: ${correctAnswers} dari ${totalQuestions}
- Feedback essay: ${essayFeedbacks.join(', ')}

Buat feedback yang:
- Positif dan memotivasi
- Memberikan semangat untuk terus belajar
- Maksimal 20 kata
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().replace(/"/g, '');
    } catch (error) {
      console.log('AI overall feedback failed, using fallback');
      // Fallback: Score-based feedback
      if (percentage >= 90) {
        return "Luar biasa! Prestasi yang sangat membanggakan, pertahankan semangat belajar ini!";
      } else if (percentage >= 80) {
        return "Sangat bagus! Sedikit lagi untuk sempurna, terus tingkatkan usahamu!";
      } else if (percentage >= 70) {
        return "Bagus! Hasil yang memuaskan, terus belajar untuk hasil yang lebih baik!";
      } else if (percentage >= 60) {
        return "Cukup baik! Tingkatkan lagi usaha belajarmu untuk hasil yang lebih optimal!";
      } else if (percentage >= 50) {
        return "Terus berusaha! Perbanyak latihan dan belajar untuk meningkatkan kemampuan!";
      } else {
        return "Jangan menyerah! Belajar lebih giat lagi, kesuksesan pasti akan datang!";
      }
    }
  }
}