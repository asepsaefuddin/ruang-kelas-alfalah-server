import { IsObject, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsObject()
  @IsNotEmpty()
  jawaban: Record<string, string>; // { "1": "a", "2": "b", "3": "essay answer" }

  @IsOptional()
  @IsString()
  user_id?: string;
}