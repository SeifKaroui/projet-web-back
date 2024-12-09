import { Controller, Post, Body, UseGuards,Delete, Param, ParseIntPipe ,Get,Query} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Student, Teacher } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { JoinCourseDto } from './dto/join-course.dto';

@Controller('courses')
//@UseGuards(JwtAuthGuard, TeacherGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @GetUser() teacher: Teacher) {
    return this.coursesService.create(createCourseDto, teacher);
  }
  @Get()
async findAllByTeacher(@Query('teacherId') teacherId?: number) {
  return this.coursesService.findAllByTeacher(teacherId);
}
@Get()
async findAll() {
  return this.coursesService.findAll();
}
  @Delete(':id')
  archive(@Param('id',ParseIntPipe) id: number,@GetUser() teacher: Teacher
  ) {
    return this.coursesService.archive(id, teacher 
      );
  }
 
  
    @Post('join')
    async joinCourse(
      @Body() joinCourseDto: JoinCourseDto,
      @GetUser() student: Student
    ) {
      return this.coursesService.joinCourseByCode(joinCourseDto.code, student);
    }
    @Get(':id/students')
    async getCourseStudents(
      @Param('id', ParseIntPipe) courseId: number,
      @GetUser() teacher: Teacher
    ) {
      return this.coursesService.getCourseStudents(courseId, teacher
        );
    }
   @Post(':id/join')
async joinByInvitation(
  @Param('id', ParseIntPipe) courseId: number,
  @GetUser() student: Student
) {
  return this.coursesService.joinCourseByInvitation(courseId, student );
}

}
