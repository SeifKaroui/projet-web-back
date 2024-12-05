import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from './entities/absence.entity';
import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';

@Module({
  imports: [TypeOrmModule.forFeature([Absence])],
  exports: [TypeOrmModule],
  controllers: [AbsencesController],
  providers: [AbsencesService],
})
export class AbsencesModule {}