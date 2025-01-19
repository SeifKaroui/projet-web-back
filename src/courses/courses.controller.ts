import { Controller, Post, Body, UseGuards, Delete, Param, ParseIntPipe, Get, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Student, Teacher, User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { JoinCourseDto } from './dto/join-course.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StudentGuard } from 'src/auth/guards/student.guard';

@Controller('courses')

export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

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
    return this.coursesService.findAllByTeacher(teacher);
  }
  /*@Get('all')
  @ApiBearerAuth()
  async findAll() {
    return this.coursesService.findAll();
  }*/
  @UseGuards(JwtAuthGuard, TeacherGuard)
  @Delete(':id') //(//change to patch)
  @ApiBearerAuth()
  archive(@Param('id', ParseIntPipe) id: number, @GetUser() teacher: Teacher) {
    return this.coursesService.archive(id, teacher);
  }


  @UseGuards(JwtAuthGuard, StudentGuard)
  @Post('join')
  @ApiBearerAuth()
  async joinCourse(
    @Body() joinCourseDto: JoinCourseDto,
    @GetUser() student: Student,
  ) {
    return this.coursesService.joinCourseByCode(joinCourseDto.code, student);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/students')
  @ApiBearerAuth()
  async getCourseStudents(
    @Param('id', ParseIntPipe) courseId: number,
    @GetUser() user: User // Récupérez l'utilisateur connecté (Teacher ou Student)
  ) {
    return this.coursesService.getCourseStudents(courseId, user);
  }



  /* @Post(':id/join')

    //return the students of a course by invitation with the course id


   @ApiBearerAuth()
/*async joinByInvitation(
  @Param('id', ParseIntPipe) courseId: number,
  @GetUser() student: Student
) {
  return this.coursesService.joinCourseByInvitation(courseId, student );
}*/
  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('my-enrolled-courses')
  @ApiBearerAuth()
  async getEnrolledCourses(@GetUser() student: Student) {
    return this.coursesService.findStudentCourses(student);
  }
}


