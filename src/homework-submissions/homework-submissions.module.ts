import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkSubmissionsController } from './homework-submissions.controller';
import { HomeworkSubmissionsService } from './homework-submissions.service';
import { HomeworkSubmission } from './entities/homework-submission.entity';
import { Homework } from '../homework/entities/homework.entity';
import { Student } from '../users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([HomeworkSubmission, Homework, Student,Course]),UploadsModule],
  controllers: [HomeworkSubmissionsController],
  providers: [HomeworkSubmissionsService],
})
export class HomeworkSubmissionsModule {}
