import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Homework } from './entities/homework.entity';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDTO } from './dto/homework.dto';
import { UpdateResult } from 'typeorm';
import { TeacherOwnershipGuard } from './homework.guard';

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
    createHomework(
        @Body() createHomeworkDTO: CreateHomeworkDTO,
    ) {
        return this.homeworkService.create(createHomeworkDTO);
    }
    @Patch(':id')
    updateHomework(
        @Param('id') id: number,
        @Body() updateHomeworkDTO: CreateHomeworkDTO
    ): Promise<Homework> {
        return this.homeworkService.update(id, updateHomeworkDTO);
    }
    @Patch("delete/:id")
    deleteHomework(
        @Param('id') id: number
    ): Promise<UpdateResult> {
        return this.homeworkService.softDelete(id);

    }
}


