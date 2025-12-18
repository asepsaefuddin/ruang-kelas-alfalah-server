import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SoalsService } from './soals.service';
import { SoalsController } from './soals.controller';
import { Soal, SoalSchema } from './schemas/soal.schema';
import { AnswerResult, AnswerResultSchema } from './schemas/answer-result.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Soal.name, schema: SoalSchema },
      { name: AnswerResult.name, schema: AnswerResultSchema },
      { name: User.name, schema: UserSchema }
    ]),
    CloudinaryModule,
  ],
  controllers: [SoalsController],
  providers: [SoalsService],
  exports: [SoalsService],
})
export class SoalsModule {}