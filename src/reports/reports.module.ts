import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { ReportsController } from './reports.controller';
// import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Answer, AnswerSchema } from '../answers/schemas/answer.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Soal, SoalSchema } from '../soals/schemas/soal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Answer.name, schema: AnswerSchema },
      { name: User.name, schema: UserSchema },
      { name: Soal.name, schema: SoalSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}