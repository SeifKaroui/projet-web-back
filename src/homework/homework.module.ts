import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { Homework } from './entities/homework.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Homework])],
  controllers: [HomeworkController],
  providers: [HomeworkService]
})
export class HomeworkModule {}
