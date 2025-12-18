import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  ValidateIf,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SoalType {
  PILIHAN_GANDA = 'pilihan ganda',
  ESSAY = 'essay',
}

export class SoalItemDto {
  @IsEnum(SoalType, { message: 'Tipe soal harus "pilihan ganda" atau "essay"' })
  type: SoalType;

  @IsString()
  @IsNotEmpty()
  soal: string;

  @IsString()
  gambar?: string; // URL gambar (optional)

  @IsArray()
  @ValidateIf((o) => o.type === SoalType.PILIHAN_GANDA)
  list_jawaban: string[]; // untuk pilihan ganda

  @IsString()
  @ValidateIf((o) => o.type === SoalType.PILIHAN_GANDA)
  jawaban_benar?: string; // jawaban benar untuk pilihan ganda

  @IsString()
  @ValidateIf((o) => o.type === SoalType.ESSAY)
  kunci_jawaban?: string; // kunci jawaban untuk essay
}

export class CreateSoalDto {
  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoalItemDto)
  soal: SoalItemDto[];

  @IsNumber()
  @Min(0, { message: 'Minimal nilai tidak boleh kurang dari 0' })
  @Max(100, { message: 'Minimal nilai tidak boleh lebih dari 100' })
  minimalNilai: number; // Minimal nilai untuk lulus

  @IsNumber()
  @Min(1, { message: 'Durasi ujian minimal 1 menit' })
  durasi: number; // Durasi ujian dalam menit
}