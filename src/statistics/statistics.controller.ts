import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // Hanya admin yang bisa lihat statistik lengkap
  @Roles('admin')
  @Get()
  async getOverallStatistics(@Query('days') days: string = '30') {
    try {
      const activityDays = parseInt(days, 10) || 30;
      const stats = await this.statisticsService.getOverallStatistics(activityDays);
      
      return {
        success: true,
        message: 'Statistik keseluruhan berhasil diambil',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik keseluruhan',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin dan guru bisa lihat quick stats
  @Roles('admin', 'guru')
  @Get('quick')
  async getQuickStats() {
    try {
      const stats = await this.statisticsService.getQuickStats();
      
      return {
        success: true,
        message: 'Statistik ringkas berhasil diambil',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik ringkas',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Hanya admin yang bisa lihat user statistics
  @Roles('admin')
  @Get('users')
  async getUserStatistics() {
    try {
      const stats = await this.statisticsService.getUserStatistics();
      
      return {
        success: true,
        message: 'Statistik user berhasil diambil',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik user',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin dan guru bisa lihat student performance
  @Roles('admin', 'guru')
  @Get('performance')
  async getStudentPerformance() {
    try {
      const performance = await this.statisticsService.getStudentPerformance();
      
      return {
        success: true,
        message: 'Statistik performa siswa berhasil diambil',
        data: performance,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik performa siswa',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin dan guru bisa lihat activity statistics
  @Roles('admin', 'guru')
  @Get('activity')
  async getActivityStatistics(@Query('days') days: string = '30') {
    try {
      const activityDays = parseInt(days, 10) || 30;
      const activity = await this.statisticsService.getActivityStatistics(activityDays);
      
      return {
        success: true,
        message: `Statistik aktivitas ${activityDays} hari terakhir berhasil diambil`,
        data: activity,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik aktivitas',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin dan guru bisa lihat AI summary
  @Roles('admin', 'guru')
  @Get('ai-summary')
  async getAISummary() {
    try {
      const summary = await this.statisticsService.getAISummary();
      
      return {
        success: true,
        message: 'Ringkasan AI berhasil diambil',
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil ringkasan AI',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Siswa melihat statistik miliknya sendiri
  @Roles('siswa')
  @Get('me')
  async getMyStatistics(@CurrentUser() user: any) {
    try {
      const data = await this.statisticsService.getStudentSelfStatistics(user.userId);
      return {
        success: true,
        message: 'Statistik siswa berhasil diambil',
        data,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil statistik siswa',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}