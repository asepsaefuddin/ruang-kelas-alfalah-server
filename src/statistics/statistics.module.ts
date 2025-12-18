import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { StatisticsController } from './statistics.controller';
// import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Soal, SoalSchema } from '../soals/schemas/soal.schema';
import { Answer, AnswerSchema } from '../answers/schemas/answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Soal.name, schema: SoalSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}