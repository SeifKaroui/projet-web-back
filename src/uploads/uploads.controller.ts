import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@Controller('files')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          cb(null, UploadsService.generateFilename(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = UploadsService.generateFilename(file.originalname);
    const uploadFileDto: UploadFileDto = {
      filename,
      size: file.size,
    };
    return await this.uploadsService.saveFile(uploadFileDto);
  }
}
