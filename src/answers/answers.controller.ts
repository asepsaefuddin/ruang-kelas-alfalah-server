import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('answer')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  // Siswa bisa ambil soal berdasarkan kode
  @Roles('siswa', 'admin')
  @Get(':kode')
  async getSoalByKode(@Param('kode') kode: string) {
    return await this.answersService.getSoalByKode(kode);
  }

  // Siswa bisa submit jawaban  
  @Roles('siswa', 'admin')
  @Post(':kode')
  @HttpCode(HttpStatus.CREATED)
  async submitAnswer(
    @Param('kode') kode: string,
    @Body() createAnswerDto: CreateAnswerDto,
    @CurrentUser() user: any,
  ) {
    console.log('🎯 Controller - Submit Answer Debug:', {
      kode,
      userId: user.userId,
      requestBody: createAnswerDto,
      userFromToken: user
    });
    
    // Auto set user_id dari token
    createAnswerDto.user_id = user.userId;
    
    console.log('📤 Final submission data:', createAnswerDto);
    
    return await this.answersService.submitAnswer(kode, createAnswerDto);
  }

  // Hanya admin yang bisa lihat semua jawaban (guru tidak bisa answer management)
  @Roles('admin')
  @Get('results/all')
  async findAllAnswers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('isLulus') isLulus?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const lulusFilter = isLulus === 'true' ? true : isLulus === 'false' ? false : undefined;
    
    const result = await this.answersService.findAll(pageNumber, limitNumber, lulusFilter);
    return {
      success: true,
      message: 'Data jawaban berhasil diambil',
      ...result,
    };
  }

  // Hanya admin yang bisa lihat summary (guru tidak boleh answer management)
  @Roles('admin')
  @Get('summary')
  async getAnswersSummary() {
    const summary = await this.answersService.getAnswersSummary();
    return {
      success: true,
      message: 'Summary data jawaban berhasil diambil',
      data: summary,
    };
  }

  // Admin bisa lihat semua, siswa hanya bisa lihat hasil sendiri
  @Roles('admin', 'siswa')
  @Get('results/:kode')
  async findAnswersByKode(@Param('kode') kode: string) {
    const answers = await this.answersService.findByKode(kode);
    return {
      success: true,
      message: `Data jawaban untuk kode ${kode} berhasil diambil`,
      data: answers,
    };
  }
}