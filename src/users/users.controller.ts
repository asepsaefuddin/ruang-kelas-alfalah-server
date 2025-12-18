import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseObjectIdPipe } from './pipes/parse-objectid.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import * as XLSX from 'xlsx';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'User berhasil dibuat',
      data: user,
    };
  }

  /**
   * Bulk create users from Excel file
   * Endpoint untuk membuat multiple users sekaligus dari file Excel
   * Format Excel yang diharapkan:
   * - Row 1: Header (username, password, namaLengkap, nipNim, role, status, kelas, mataPelajaran)
   * - Row 2+: Data user
   */
  @Post('bulk-create')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@UploadedFile() file: Express.Multer.File) {
    // Validate file upload
    if (!file) {
      throw new BadRequestException('File Excel tidak ditemukan. Silakan upload file .xlsx atau .xls');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)');
    }

    try {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Find header row (look for row containing 'username' field)
      let headerRow = 0;
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Search for header row (up to row 5)
      for (let row = 0; row <= Math.min(4, range.e.r); row++) {
        const rowData = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell) {
            const value = String(cell.v || '').toLowerCase().trim();
            rowData.push(value);
          }
        }
        
        // Check if this row contains 'username' header
        if (rowData.includes('username')) {
          headerRow = row;
          break;
        }
      }
      
      // Create a new worksheet starting from header row
      const newRange = {
        s: { r: headerRow, c: range.s.c },
        e: { r: range.e.r, c: range.e.c }
      };
      const newRef = XLSX.utils.encode_range(newRange);
      
      // Create a new worksheet with data starting from header row
      const newWorksheet: any = {};
      for (let row = headerRow; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const newCellAddress = XLSX.utils.encode_cell({ r: row - headerRow, c: col });
          if (worksheet[cellAddress]) {
            newWorksheet[newCellAddress] = worksheet[cellAddress];
          }
        }
      }
      newWorksheet['!ref'] = newRef;
      
      // Convert to JSON starting from header row
      const rawData = XLSX.utils.sheet_to_json(newWorksheet, { 
        defval: '',
      });

      if (rawData.length === 0) {
        throw new BadRequestException('File Excel kosong. Silakan isi data user terlebih dahulu');
      }

      // Filter out empty rows (rows where all fields are empty)
      const filteredData = rawData.filter((row: any) => {
        const username = String(row.username || row.Username || '').trim();
        const password = String(row.password || row.Password || '').trim();
        const namaLengkap = String(row.namaLengkap || row['Nama Lengkap'] || row.nama || '').trim();
        return username || password || namaLengkap; // At least one field should have value
      });

      if (filteredData.length === 0) {
        throw new BadRequestException('Tidak ada data user yang valid. Pastikan data diisi dengan benar.');
      }

      // Transform Excel data to CreateUserDto format
      const users: CreateUserDto[] = filteredData.map((row: any) => ({
        username: String(row.username || row.Username || '').trim(),
        password: String(row.password || row.Password || '').trim(),
        namaLengkap: String(row.namaLengkap || row['Nama Lengkap'] || row.nama || '').trim(),
        nipNim: String(row.nipNim || row['NIP/NIM'] || row.nip || row.nim || '').trim(),
        role: String(row.role || row.Role || '').toLowerCase().trim(),
        status: String(row.status || row.Status || 'aktif').toLowerCase().trim(),
        kelas: row.kelas || row.Kelas || undefined,
        mataPelajaran: row.mataPelajaran || row['Mata Pelajaran'] || row.mapel || undefined,
      }));

      // Process bulk creation
      const result = await this.usersService.bulkCreate(users);

      return {
        success: result.success,
        message: result.message,
        summary: result.summary,
        results: result.results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Gagal memproses file Excel: ${error.message}. Pastikan format Excel sesuai template`,
      );
    }
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('kelas') kelas?: string,
    @Query('mataPelajaran') mataPelajaran?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.usersService.findAll(+page, +limit, role, kelas, mataPelajaran, search);
    return {
      success: true,
      message: 'Data user berhasil diambil',
      ...result,
    };
  }

  @Get(':_id')
  @Roles('admin')
  async findOne(@Param('_id', ParseObjectIdPipe) _id: string) {
    const user = await this.usersService.findOne(_id);
    return {
      success: true,
      message: 'Data user berhasil diambil',
      data: user,
    };
  }

  @Put(':_id')
  @Roles('admin')
  async update(
    @Param('_id', ParseObjectIdPipe) _id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(_id, updateUserDto);
    return {
      success: true,
      message: 'User berhasil diupdate',
      data: user,
    };
  }

  @Delete(':_id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('_id', ParseObjectIdPipe) _id: string) {
    const result = await this.usersService.remove(_id);
    return {
      success: true,
      message: result.message,
    };
  }

  // Endpoint khusus untuk siswa berdasarkan kelas
  @Get('siswa/kelas/:kelas')
  @Roles('admin', 'guru')
  async getSiswaByKelas(@Param('kelas') kelas: string) {
    const siswa = await this.usersService.getSiswaByKelas(kelas);
    return {
      success: true,
      message: `Data siswa kelas ${kelas} berhasil diambil`,
      data: siswa,
    };
  }

  // Endpoint khusus untuk guru berdasarkan mata pelajaran
  @Get('guru/mataPelajaran/:mataPelajaran')
  @Roles('admin')
  async getGuruByMataPelajaran(@Param('mataPelajaran') mataPelajaran: string) {
    const guru = await this.usersService.getGuruByMataPelajaran(mataPelajaran);
    return {
      success: true,
      message: `Data guru mata pelajaran ${mataPelajaran} berhasil diambil`,
      data: guru,
    };
  }

  // Endpoint untuk mendapatkan semua kelas
  @Get('reference/kelas')
  @Roles('admin', 'guru')
  async getAllKelas() {
    const kelas = await this.usersService.getAllKelas();
    return {
      success: true,
      message: 'Data semua kelas berhasil diambil',
      data: kelas,
    };
  }

  // Endpoint untuk mendapatkan semua mata pelajaran
  @Get('reference/mataPelajaran')
  @Roles('admin', 'guru')
  async getAllMataPelajaran() {
    const mataPelajaran = await this.usersService.getAllMataPelajaran();
    return {
      success: true,
      message: 'Data semua mata pelajaran berhasil diambil',
      data: mataPelajaran,
    };
  }
}