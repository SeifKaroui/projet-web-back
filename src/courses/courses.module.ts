import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Result } from './entities/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Result]),
    MailerModule,
  ],
  exports: [TypeOrmModule, CoursesService],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule { }
