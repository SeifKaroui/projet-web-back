import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    MailerModule,
  ],
  exports: [TypeOrmModule, CoursesService],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
