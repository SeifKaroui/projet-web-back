import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';
import { Repository } from 'typeorm';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadedFileRepository: Repository<Upload>,
  ) {}

  async saveFile(uploadFileDto: UploadFileDto): Promise<Upload> {
    const file = this.uploadedFileRepository.create(uploadFileDto);
    return await this.uploadedFileRepository.save(file);
  }
  static generateFilename(filename: string) {
    return `${Date.now()}-${filename}`;
  }
}
