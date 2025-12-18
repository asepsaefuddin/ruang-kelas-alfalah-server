import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Hanya admin dan guru yang bisa lihat semua reports
  @Roles('admin', 'guru')
  @Get()
  async getAllReports(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('kelas') kelas?: string,
    @Query('status') status?: 'Lulus' | 'Tidak Lulus',
    @Query('kodeSoal') kodeSoal?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const result = await this.reportsService.getAllReports(
      pageNumber,
      limitNumber,
      kelas,
      status,
      kodeSoal,
    );
    return {
      success: true,
      message: 'Data laporan nilai berhasil diambil',
      ...result,
    };
  }

  // Hanya admin dan guru yang bisa lihat summary reports
  @Roles('admin', 'guru')
  @Get('summary')
  async getReportSummary() {
    const summary = await this.reportsService.getReportSummary();
    return {
      success: true,
      message: 'Summary laporan nilai berhasil diambil',
      data: summary,
    };
  }

  @Get('debug/verify/:answerId')
  async verifyReportExists(@Param('answerId') answerId: string) {
    try {
      const verification = await this.reportsService.verifyAnswerExists(answerId);
      
      return {
        success: true,
        message: 'Verifikasi answer/report berhasil',
        data: verification,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal memverifikasi answer/report',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('debug/answer-to-report/:answerId')
  async getReportFromAnswerId(@Param('answerId') answerId: string) {
    try {
      const report = await this.reportsService.getReportById(answerId);
      
      return {
        success: true,
        message: 'Report berhasil diambil dari Answer ID',
        data: report,
        note: 'Report ID sama dengan Answer ID - ini membuktikan bahwa reports tidak punya collection sendiri'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal mengambil report dari Answer ID',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    const report = await this.reportsService.getReportById(id);
    return {
      success: true,
      message: 'Detail laporan nilai berhasil diambil',
      data: report,
    };
  }

  // Hanya admin yang bisa delete report
  @Roles('admin')
  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    try {
      const deleteInfo = await this.reportsService.deleteReport(id);
      return {
        success: true,
        message: 'Laporan nilai berhasil dihapus',
        data: deleteInfo,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal menghapus laporan nilai',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('test/user/:userId/soal/:soalKode')
  async testUserSoalRoute(
    @Param('userId') userId: string,
    @Param('soalKode') soalKode: string,
  ) {
    return {
      success: true,
      message: 'Route test berhasil',
      data: {
        userId: userId,
        soalKode: soalKode,
        note: 'Ini adalah GET endpoint untuk testing. Gunakan DELETE method untuk menghapus.',
        correct_delete_url: `/reports/user/${userId}/soal/${soalKode}`,
        correct_method: 'DELETE'
      }
    };
  }

  // Hanya admin yang bisa delete berdasarkan user dan soal
  @Roles('admin')
  @Delete('user/:userId/soal/:soalKode')
  async deleteReportsByUserAndSoal(
    @Param('userId') userId: string,
    @Param('soalKode') soalKode: string,
  ) {
    try {
      const deleteInfo = await this.reportsService.deleteReportsByUserAndSoal(userId, soalKode);
      return {
        success: true,
        message: 'Semua laporan nilai user untuk soal tersebut berhasil dihapus',
        data: deleteInfo,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Gagal menghapus laporan nilai user',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}