import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerResultDocument = AnswerResult & Document;

@Schema()
export class StudentAnswer {
  @Prop({ required: true })
  pertanyaanId: string;

  @Prop({ required: true })
  jawaban: string;

  @Prop({ default: false })
  isCorrect: boolean;
}

@Schema({ timestamps: true })
export class AnswerResult {
  @Prop({ required: true })
  kodeUjian: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  namaLengkap: string;

  @Prop({ type: [StudentAnswer], required: true })
  jawaban: StudentAnswer[];

  @Prop({ required: true, min: 0, max: 100 })
  nilai: number;

  @Prop({ required: true })
  totalPertanyaan: number;

  @Prop({ required: true })
  benar: number;

  @Prop({ required: true })
  salah: number;

  @Prop({ default: false })
  lulus: boolean;

  @Prop({ required: true })
  waktuMulai: Date;

  @Prop({ required: true })
  waktuSelesai: Date;

  @Prop({ required: true })
  durasiPengerjaan: number; // dalam detik
}

export const AnswerResultSchema = SchemaFactory.createForClass(AnswerResult);