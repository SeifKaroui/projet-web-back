import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { Homework } from './entities/homework.entity';
import { UploadsService } from 'src/uploads/uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Homework]),UploadsService],
  controllers: [HomeworkController],
  providers: [HomeworkService]
})
export class HomeworkModule {}
