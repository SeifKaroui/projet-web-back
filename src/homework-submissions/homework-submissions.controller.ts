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
  UploadedFiles,
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
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';

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
      required: ['files', 'homeworkId'], 
      properties: {
        files: {
          type: 'array', 
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'The homework files to upload (PDF, DOC, DOCX, PPT, PPTX, TXT)',
        },
        homeworkId: {
          type: 'integer',
          description: 'ID of the homework being submitted',
        },
      },
    },
  })

  @UseInterceptors(CustomFilesInterceptor)
  async submitHomework(
    @Body() dto: CreateHomeworkSubmissionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: JwtUser,
  ) {

    
    if (!files) {
      
      throw new BadRequestException('No file uploaded');
    }
    return this.submissionsService.submitHomework(user.id, dto.homeworkId, files);
  }
  @Get(':homeworkId')
async getHomeworkForStudent(
  @Param('homeworkId') homeworkId: number,
  @GetUser() user: JwtUser
) {
  return this.submissionsService.getStudentHomework(user.id, homeworkId);
}
  
  @Delete(':Homeworkid')
  async deleteSubmission(
  @Param('Homeworkid') HomeworkId: number,
  @GetUser() user: JwtUser,
) {
  return this.submissionsService.deleteSubmission(HomeworkId, user.id);
}

@Patch(':subid/grade')
async gradeSubmission(
  @Param('subid') submissionId: number,
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
