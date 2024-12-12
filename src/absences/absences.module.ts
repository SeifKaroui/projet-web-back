import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from './entities/absence.entity';
import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';
import { Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absence,Student,Course])],
  exports: [TypeOrmModule],
  controllers: [AbsencesController],
  providers: [AbsencesService],
})
export class AbsencesModule {}