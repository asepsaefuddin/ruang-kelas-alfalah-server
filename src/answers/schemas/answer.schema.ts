import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer {
  @Prop({ required: true })
  kode_soal: string;

  @Prop({ type: Types.ObjectId, ref: 'Soal', required: true })
  soal_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  jawaban: Record<string, string>; // { "1": "a", "2": "b", "3": "essay answer" }

  @Prop({ required: true, default: 0 })
  score: number;

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'graded'

  @Prop()
  feedback?: string; // Overall feedback from AI

  @Prop({ type: Array })
  detailed_results?: any[]; // Detailed feedback per question

  @Prop({ required: true, default: 0 })
  percentage: number; // Persentase nilai (0-100)

  @Prop({ required: true, default: 0 })
  minimalNilai: number; // Minimal nilai yang diperlukan untuk lulus

  @Prop({ required: true, default: false })
  isLulus: boolean; // Status kelulusan
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);