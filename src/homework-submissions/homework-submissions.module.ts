import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkSubmissionsController } from './homework-submissions.controller';
import { HomeworkSubmissionsService } from './homework-submissions.service';
import { HomeworkSubmission } from './entities/homework-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeworkSubmission])],
  controllers: [HomeworkSubmissionsController],
  providers: [HomeworkSubmissionsService]
})
export class HomeworkSubmissionsModule {}
