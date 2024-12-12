import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';
import { Repository } from 'typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UploadsUtils } from './utils/uploads-utils';
import { existsSync } from 'fs';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  async saveFiles(files: Express.Multer.File[]): Promise<Upload[]> {
    const createUploadDtoList: CreateUploadDto[] = files.map((item) => {
      return {
        originalname: item.originalname,
        filename: item.filename,
        size: item.size,
        mimetype: item.mimetype,
      };
    });

    const result = [];

    for (let i = 0; i < createUploadDtoList.length; i++) {
      const upload = await this.createUpload(createUploadDtoList[i]);
      if (!upload) {
        throw new InternalServerErrorException("File couldn't be saved.");
      }

      result.push(upload);
    }
    return result;
  }

  async getFileInfo(fileId: number) {
    const upload = await this.uploadRepository.findOneBy({ id: fileId });
    if (!upload) {
      throw new NotFoundException(`File with id: ${fileId} not found.`);
    }

    const filePath = UploadsUtils.getFullFilepath(upload.filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return {
      filePath,
      mimetype: upload.mimetype,
    };
  }

  private async createUpload(
    createUploadDto: CreateUploadDto,
  ): Promise<Upload> {
    const upload = this.uploadRepository.create(createUploadDto);
    return this.uploadRepository.save(upload);
  }
}
