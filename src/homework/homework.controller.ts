import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Homework } from './entities/homework.entity';
import { HomeworkService } from './homework.service';
import { UpdateResult } from 'typeorm';
import { TeacherGuard } from './homework.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateHomeworkDTO, UpdateHomeworkDTO } from './dto/homework.dto';
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiBearerAuth()
@Controller('homework')
export class HomeworkController {
    constructor(
        private homeworkService: HomeworkService,
    ) { }
   /**
    * get the homeworks of the user
    * @param user 
    * @returns 
    */
    @Get()
    getHomeworks(
        @GetUser() user
    ): Promise<Homework[]> {
        return this.homeworkService.findAll_(user);
    }
    
    /**
     * get the homeworks of a course if user is part of the course
     * @param courseId 
     * @param user 
     * @returns 
     */
    @Get("course/:courseId")
    getHomeworkByCourse(
        @Param('courseId') courseId: number,
        @GetUser() user
    ): Promise<Homework[]> {
        return this.homeworkService.findAll_(user,courseId);
    }
    /**
     * get homework by id if the user have access to it 
     * @param user 
     * @param id 
     * @returns 
     */
    @Get(':id')
    getHomeworkById(
        @GetUser() user,
        @Param('id') id: number
    ): Promise<Homework> {
        return this.homeworkService.findOne_(user,id);
    }
    @Post()
    @UseGuards(TeacherGuard)
    @UseInterceptors(CustomFilesInterceptor)
    createHomework(
        @GetUser() user,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createHomeworkDTO: CreateHomeworkDTO,
    ) {
        
        return this.homeworkService.create_hw(user,createHomeworkDTO, files);
    }
    @Patch(':id')
    @UseGuards(TeacherGuard)
    @UseInterceptors(CustomFilesInterceptor)
    updateHomework(
        @GetUser() user,
        @Param('id') id: number,
        @Body() updateHomeworkDTO: UpdateHomeworkDTO,
        @UploadedFiles() files: Express.Multer.File[]

    ): Promise<Homework|HttpException> {
        return this.homeworkService.update_hw(id, user["id"], updateHomeworkDTO,files);
    }
    @Patch("delete/:id")
    @UseGuards(TeacherGuard)
    deleteHomework(
        @Param('id') id: number
    ): Promise<UpdateResult> {
        return this.homeworkService.softDelete(id);

    }
}


