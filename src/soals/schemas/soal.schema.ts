import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SoalDocument = Soal & Document;

@Schema()
export class SoalItem {
  @Prop({ required: true })
  type: string; // 'pilihan ganda' atau 'essay'

  @Prop({ required: true })
  soal: string;

  @Prop()
  gambar?: string; // URL gambar dari Cloudinary (optional)

  @Prop({ type: [String] })
  list_jawaban?: string[]; // untuk pilihan ganda

  @Prop()
  jawaban?: string; // untuk essay (jawaban yang benar)
}

@Schema({ timestamps: true })
export class Soal {
  @Prop({ required: true, unique: true })
  kode: string;

  @Prop({ required: true })
  judul: string;

  @Prop({ type: [SoalItem], required: true })
  soal: SoalItem[];

  @Prop({ required: true, min: 0, max: 100 })
  minimalNilai: number; // Minimal nilai untuk lulus (0-100)

  @Prop({ required: true, min: 1 })
  durasi: number; // Durasi ujian dalam menit
}

export const SoalSchema = SchemaFactory.createForClass(Soal);