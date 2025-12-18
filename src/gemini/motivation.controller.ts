import { Controller, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('motivation')
export class MotivationController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get()
  async getMotivation() {
    const motivation = await this.geminiService.generateMotivation();
    return {
      success: true,
      message: 'Kata motivasi berhasil diambil',
      data: {
        motivation: motivation,
        timestamp: new Date().toISOString(),
      },
    };
  }
}