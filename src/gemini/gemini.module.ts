import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { MotivationController } from './motivation.controller';

@Module({
  providers: [GeminiService],
  controllers: [MotivationController],
  exports: [GeminiService],
})
export class GeminiModule {}