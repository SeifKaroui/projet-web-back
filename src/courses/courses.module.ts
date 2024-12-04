import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  exports: [TypeOrmModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
