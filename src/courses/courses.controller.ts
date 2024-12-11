import { Controller, Post, Body, UseGuards,Delete, Param, ParseIntPipe ,Get,Query} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Student, Teacher } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { JoinCourseDto } from './dto/join-course.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('courses')
@UseGuards(JwtAuthGuard, TeacherGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
 

  @Post()
  @ApiBearerAuth()
  create(@Body() createCourseDto: CreateCourseDto, @GetUser() teacher: Teacher) {
    return this.coursesService.create(createCourseDto, teacher);
  }
  @Get()
  @ApiBearerAuth()
async findAllByTeacher(@Query('teacherId') teacherId?: number) {
  return this.coursesService.findAllByTeacher(//teacherId
    );
}
@Get()
@ApiBearerAuth()
async findAll() {
  return this.coursesService.findAll();
}
  @Delete(':id')
  @ApiBearerAuth()
  archive(@Param('id',ParseIntPipe) id: number,@GetUser() teacher: Teacher ) {
    return this.coursesService.archive(id, teacher );
  }
 
  
    @Post('join')
    @ApiBearerAuth()
    async joinCourse(
      @Body() joinCourseDto: JoinCourseDto,
      @GetUser() student: Student
    ) {
      return this.coursesService.joinCourseByCode(joinCourseDto.code, student);
    }
    @Get(':id/students')
    @ApiBearerAuth()
    async getCourseStudents(
      @Param('id', ParseIntPipe) courseId: number,
      @GetUser() teacher: Teacher
    ) {
      return this.coursesService.getCourseStudents(courseId);
    }
    //return the students of a course by invitation with the course id
   @Post(':id/join')
   @ApiBearerAuth()
async joinByInvitation(
  @Param('id', ParseIntPipe) courseId: number,
  @GetUser() student: Student
) {
  return this.coursesService.joinCourseByInvitation(courseId, student );
}

}


