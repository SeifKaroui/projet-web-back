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

export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
 
@UseGuards(JwtAuthGuard, TeacherGuard)
  @Post()
  @ApiBearerAuth()
  create(@Body() createCourseDto: CreateCourseDto, @GetUser() teacher: Teacher) {
    return this.coursesService.create(createCourseDto, teacher);
  }
  @UseGuards(JwtAuthGuard, TeacherGuard)
  @Get('my-courses')
  @ApiBearerAuth()
async findAllByTeacher(@GetUser() teacher: Teacher) {
  return this.coursesService.findAllByTeacher(teacher.id);
}
@Get('all')
@ApiBearerAuth()
async findAll() {
  return this.coursesService.findAll();
}
@UseGuards(JwtAuthGuard, TeacherGuard)
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
    @UseGuards(JwtAuthGuard, TeacherGuard)
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


