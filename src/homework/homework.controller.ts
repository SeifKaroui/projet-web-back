import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Homework } from './entities/homework.entity';
import { HomeworkService } from './homework.service';
import { UpdateResult } from 'typeorm';
import { TeacherOwnershipGuard } from './homework.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateHomeworkDTO } from './dto/homework.dto';
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';

@ApiBearerAuth()
@UseGuards(TeacherOwnershipGuard)
@Controller('homework')
export class HomeworkController {
    constructor(
        private homeworkService: HomeworkService,
    ) { }

    @Get()
    getHomework(): Promise<Homework[]> {
        return this.homeworkService.findAll();
    }
    @Get(':id')
    getHomeworkById(
        @Param('id') id: number
    ): Promise<Homework> {
        return this.homeworkService.findOne(id);
    }
    @Post()
    @UseInterceptors(CustomFilesInterceptor)
    createHomework(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createHomeworkDTO: CreateHomeworkDTO,
    ) {
        
        return this.homeworkService.create_hw(createHomeworkDTO, files);
    }
    @Patch(':id')
    @UseInterceptors(CustomFilesInterceptor)
    updateHomework(
        @Param('id') id: number,
        @Body() updateHomeworkDTO: CreateHomeworkDTO,
        @UploadedFiles() files: Express.Multer.File[]

    ): Promise<Homework> {
        return this.homeworkService.update_hw(id, updateHomeworkDTO,files);
    }
    @Patch("delete/:id")
    deleteHomework(
        @Param('id') id: number
    ): Promise<UpdateResult> {
        return this.homeworkService.softDelete(id);

    }
}


