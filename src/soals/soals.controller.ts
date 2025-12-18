import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as mammoth from 'mammoth';
import { SoalsService } from './soals.service';
import { CreateSoalDto } from './dto/create-soal.dto';
import { UpdateSoalDto } from './dto/update-soal.dto';
import { ParseObjectIdPipe } from '../users/pipes/parse-objectid.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('soals')
export class SoalsController {
  constructor(
    private readonly soalsService: SoalsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Roles('admin', 'guru')  // Hanya admin dan guru yang bisa create soal
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      let soalData: CreateSoalDto;

      // Handle form-data vs JSON
      if (body.data) {
        // Form-data: data sebagai JSON string, gambar sebagai files
        soalData = JSON.parse(body.data);
      } else {
        // JSON request biasa
        soalData = body;
      }

      // Upload gambar ke Cloudinary jika ada files
      if (files && files.length > 0) {
        console.log(`📸 Uploading ${files.length} images to Cloudinary...`);
        
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            const url = await this.cloudinaryService.uploadImage(file);
            console.log(`✅ Image uploaded: ${url}`);
            return url;
          })
        );

        // Assign image URLs hanya ke soal yang membutuhkan gambar (yang ditandai dengan placeholder atau field khusus)
        let imageIndex = 0;
        soalData.soal.forEach((item, soalIndex) => {
          // Cek apakah soal ini membutuhkan gambar berdasarkan type atau field khusus
          const needsImage = item.type?.includes('image') || 
                           item.soal?.toLowerCase().includes('gambar') ||
                           item.soal?.toLowerCase().includes('diagram') ||
                           item.soal?.toLowerCase().includes('foto') ||
                           item.soal?.toLowerCase().includes('lihat') ||
                           item.soal?.toLowerCase().includes('perhatikan') ||
                           item.soal?.toLowerCase().includes('berdasarkan gambar');
          
          if (needsImage && imageUrls[imageIndex]) {
            item.gambar = imageUrls[imageIndex];
            console.log(`🔗 Assigned image ${imageIndex} to soal ${soalIndex + 1}: ${imageUrls[imageIndex]}`);
            imageIndex++;
          }
        });
      }

      console.log('📝 Creating soal with data:', JSON.stringify(soalData, null, 2));
      const soal = await this.soalsService.create(soalData);
      
      return {
        success: true,
        message: 'Soal berhasil dibuat',
        data: soal,
      };
    } catch (error) {
      console.error('❌ Error creating soal:', error);
      throw new BadRequestException(`Failed to create soal: ${error.message}`);
    }
  }

  // Endpoint to import soal file (.docx, .doc, .csv, .xlsx)
  @Roles('admin', 'guru')
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      // Try to extract text from Word (.docx) using mammoth
      let text = '';
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value || '';
      } catch (err) {
        // Fallback: try to read buffer as utf8 text (for csv/xlsx cases user might upload csv)
        text = file.buffer.toString('utf8');
      }

      // Parse [SOAL:id] ... [/SOAL] blocks
      const soalPattern = /\[SOAL:(\d+)\]([\s\S]*?)\[\/SOAL\]/g;
      const parsed = [] as any[];
      let m;
      while ((m = soalPattern.exec(text)) !== null) {
        const id = m[1];
        const body = m[2];
        const lines = body.split(/\r?\n/).map(l => l.trim()).filter(l => l);

        const item: any = { id };
        for (const line of lines) {
          const pert = line.match(/^Pertanyaan:\s*(.+)$/i)?.[1];
          if (pert) { item.pertanyaan = pert; continue }

          const tipe = line.match(/^Tipe:\s*(.+)$/i)?.[1];
          if (tipe) { item.tipe = tipe; continue }

          const a = line.match(/^A:\s*(.+)$/i)?.[1]; if (a) { item.A = a; continue }
          const b = line.match(/^B:\s*(.+)$/i)?.[1]; if (b) { item.B = b; continue }
          const c = line.match(/^C:\s*(.+)$/i)?.[1]; if (c) { item.C = c; continue }
          const d = line.match(/^D:\s*(.+)$/i)?.[1]; if (d) { item.D = d; continue }

          const jaw = line.match(/^Jawaban:\s*(.+)$/i)?.[1]; if (jaw) { item.jawaban = jaw; continue }
          const vars = line.match(/^Variables:\s*(.+)$/i)?.[1]; if (vars) { item.variables = vars; continue }
          const variants = line.match(/^Variants:\s*(\d+)/i)?.[1]; if (variants) { item.variants = Number(variants); continue }
        }

        parsed.push(item);
      }

      // Generate final question list (expand variants if needed)
      const generated: any[] = [];

      function randInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      for (const p of parsed) {
        const variants = p.variants && p.variants > 0 ? p.variants : 1;
        const specs: Record<string,string> = {};
        if (p.variables) {
          p.variables.split(';').forEach(s => {
            const [k,v] = s.split(':').map(x=>x.trim()); if (k && v) specs[k]=v;
          })
        }

        for (let vi=0; vi<variants; vi++) {
          let soalText = p.pertanyaan || '';
          const values: Record<string, number> = {};
          for (const k in specs) {
            const r = specs[k].split('-').map(Number);
            const v = randInt(r[0], r[1]); values[k]=v;
            soalText = soalText.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          }

          const obj: any = {};
          obj.type = /pg|pilihan/i.test(p.tipe || '') ? 'pilihan ganda' : 'essay';
          obj.soal = soalText || p.pertanyaan || '';
          if (obj.type === 'pilihan ganda') {
            obj.pilihan_a = p.A || '';
            obj.pilihan_b = p.B || '';
            obj.pilihan_c = p.C || '';
            obj.pilihan_d = p.D || '';
            obj.list_jawaban = [obj.pilihan_a, obj.pilihan_b, obj.pilihan_c, obj.pilihan_d].filter(x=>x);
            obj.jawaban_benar = (p.jawaban || '').trim();
          } else {
            obj.kunci_jawaban = p.jawaban || '';
            obj.jawaban = p.jawaban || '';
          }
          obj.values = values;
          generated.push(obj);
        }
      }

      // If client requests to save the generated soal to DB, build payload and create
      // Client may send metadata in body.data (JSON string) or fields: kode, judul, durasi, minimalNilai
      const shouldSave = body && (body.save === 'true' || body.save === true || body.data);
      if (shouldSave) {
        let meta: any = {};
        if (body.data) {
          try {
            meta = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
          } catch (err) {
            meta = {};
          }
        }

        const soalPayload: any = {
          kode: meta.kode || body.kode || `IMPORT-${Date.now()}`,
          judul: meta.judul || body.judul || `Soal Import ${new Date().toISOString()}`,
          durasi: parseInt(meta.durasi ?? body.durasi ?? 60, 10),
          minimalNilai: parseInt(meta.minimalNilai ?? body.minimalNilai ?? 0, 10),
          soal: generated,
        };

        // Call create to persist soal (this will also upload images if provided in multipart)
        try {
          const created = await this.soalsService.create(soalPayload);
          return {
            success: true,
            message: `File diimpor dan soal disimpan (${generated.length} soal)`,
            data: created,
            questions: generated,
          };
        } catch (err) {
          console.error('Error saving imported soal:', err);
          // still return generated questions but indicate save failed
          return {
            success: false,
            message: `File diimpor tetapi gagal menyimpan soal: ${err.message}`,
            error: err.message,
            questions: generated,
          };
        }
      }

      return {
        success: true,
        message: `File diimpor, ${generated.length} soal dihasilkan`,
        questions: generated,
      };
    } catch (error) {
      console.error('Error importing file:', error);
      throw new BadRequestException(error.message || 'Failed to import file');
    }
  }

  @Roles('admin', 'guru')  // Admin dan guru bisa lihat semua soal
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const result = await this.soalsService.findAll(pageNumber, limitNumber);
    return {
      success: true,
      message: 'Data soal berhasil diambil',
      ...result,
    };
  }

  @Roles('admin', 'guru')  // Admin dan guru bisa lihat detail soal
  @Get(':_id')
  async findOne(@Param('_id', ParseObjectIdPipe) id: string) {
    const soal = await this.soalsService.findOne(id);
    return {
      success: true,
      message: 'Data soal berhasil diambil',
      data: soal,
    };
  }

  @Roles('admin', 'guru')  // Hanya admin dan guru yang bisa update soal
  @Put(':_id')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async update(
    @Param('_id', ParseObjectIdPipe) id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      let soalData: UpdateSoalDto;

      // Handle form-data vs JSON
      if (body.data) {
        // Form-data: data sebagai JSON string, gambar sebagai files
        soalData = JSON.parse(body.data);
      } else {
        // JSON request biasa
        soalData = body;
      }

      // Upload gambar baru ke Cloudinary jika ada files
      if (files && files.length > 0) {
        console.log(`📸 Uploading ${files.length} images for update...`);
        
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            const url = await this.cloudinaryService.uploadImage(file);
            console.log(`✅ Image uploaded: ${url}`);
            return url;
          })
        );

        // Assign image URLs hanya ke soal yang membutuhkan gambar
        if (soalData.soal) {
          let imageIndex = 0;
          soalData.soal.forEach((item, soalIndex) => {
            // Cek apakah soal ini membutuhkan gambar berdasarkan type atau field khusus
            const needsImage = item.type?.includes('image') || 
                             item.soal?.toLowerCase().includes('gambar') ||
                             item.soal?.toLowerCase().includes('diagram') ||
                             item.soal?.toLowerCase().includes('foto') ||
                             item.soal?.toLowerCase().includes('lihat') ||
                             item.soal?.toLowerCase().includes('perhatikan') ||
                             item.soal?.toLowerCase().includes('berdasarkan gambar');
            
            if (needsImage && imageUrls[imageIndex]) {
              item.gambar = imageUrls[imageIndex];
              console.log(`🔗 Updated image ${imageIndex} to soal ${soalIndex + 1}: ${imageUrls[imageIndex]}`);
              imageIndex++;
            }
          });
        }
      }

      console.log('📝 Updating soal with data:', JSON.stringify(soalData, null, 2));
      const soal = await this.soalsService.update(id, soalData);
      
      return {
        success: true,
        message: 'Soal berhasil diperbarui',
        data: soal,
      };
    } catch (error) {
      console.error('❌ Error updating soal:', error);
      throw new BadRequestException(`Failed to update soal: ${error.message}`);
    }
  }

  @Roles('admin', 'guru')  // Hanya admin dan guru yang bisa delete soal
  @Delete(':_id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('_id', ParseObjectIdPipe) id: string) {
    const result = await this.soalsService.remove(id);
    return {
      success: true,
      message: result.message,
    };
  }
}