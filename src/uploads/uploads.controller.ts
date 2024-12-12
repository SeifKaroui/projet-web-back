import {
  Controller,
  Get,
  Res,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';
import { Upload } from './entities/upload.entity';

@ApiBearerAuth()
@Controller('files')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  @UseInterceptors(CustomFilesInterceptor)
  @ApiConsumes('multipart/form-data')
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Upload[]> {
    return this.uploadsService.saveFiles(files);
  }

  @Public()
  @Get(':fileId')
  async retrieve(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    const result = await this.uploadsService.getFileInfo(fileId);
    res.setHeader('Content-Type', result.mimetype);
    return res.sendFile(result.filePath);
  }
}
