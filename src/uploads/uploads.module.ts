import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { Upload } from './entities/upload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
