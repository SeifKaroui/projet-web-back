import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { Homework } from './entities/homework.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [CoursesModule,UploadsModule,TypeOrmModule.forFeature([Homework])],
  controllers: [HomeworkController],
  providers: [HomeworkService]
})
export class HomeworkModule {}
