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
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';
import { Upload } from './entities/upload.entity';

@ApiBearerAuth()
@Controller('files')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}
  @Public()
  @Post('upload')
  @UseInterceptors(CustomFilesInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new post with content and files',
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'files to upload (PDF, DOC, DOCX, PPT, PPTX, TXT, etc.)',
        },
      },
    },
  })
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
