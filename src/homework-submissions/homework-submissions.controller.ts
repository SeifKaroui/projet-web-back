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
  Patch,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeworkSubmissionsService } from './homework-submissions.service';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';
import { GetUser } from 'src/common/decorators/get-user.decorator';

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
    @GetUser() user: JwtUser,
  ) {


    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.submissionsService.submitHomework(user.id, dto.homeworkId, file.path);
  }
  
  @Delete(':id')
  async deleteSubmission(
  @Param('id') homeworkId: number,
  @GetUser() user: JwtUser,
) {

  return this.submissionsService.deleteSubmission(homeworkId, user.id);
}

@Patch(':id/grade')
async gradeSubmission(
  @Param('id') submissionId: number,
  @Body() updateDto: UpdateHomeworkSubmissionDto,
  @GetUser() user: JwtUser,
) {
  

  return this.submissionsService.gradeSubmission(submissionId, user.id, updateDto);
}

@Get(':homeworkId/students-submissions')
@ApiResponse({ status: 200, description: 'List of students and their submission status for the given homework.'})
async getStudentsSubmissions(
  @Param('homeworkId') homeworkId: number,
  @GetUser() user: JwtUser,
) {
  
  return this.submissionsService.getStudentsSubmissionStatus(homeworkId, user.id);
}

}
