import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from './entities/absence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absence])],
  exports: [TypeOrmModule],
})
export class AbsencesModule {}