import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeworkSubmissionsService } from './homework-submissions.service';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';

@Controller('homework-submissions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth() 


export class HomeworkSubmissionsController {
  constructor(private readonly submissionsService: HomeworkSubmissionsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Homework submission file upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      required: ['file', 'homeworkId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The homework file to upload (PDF, DOC, DOCX, PPT, PPTX, TXT)',
        },
        homeworkId: {
          type: 'integer',
          description: 'ID of the homework being submitted',
        },
      },
    },
  })

  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf', 
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
          'text/plain'
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, TXT'), false);
        }
      },
    }),
  )
  async submitHomework(
    @Body() dto: CreateHomeworkSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {


    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const studentId = req.user.id;
    return this.submissionsService.submitHomework(studentId, dto.homeworkId, file.path);
  }
  
  @Delete(':id')
  async deleteSubmission(
  @Param('id') homeworkId: number,
  @Request() req,
) {
  const studentId = req.user.id;
  return this.submissionsService.deleteSubmission(homeworkId, studentId);
}

}
