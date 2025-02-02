import { Controller, Post, Body, UseGuards, Delete, Param, ParseIntPipe, Get, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Student, Teacher, User } from '../users/entities/user.entity';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { JoinCourseDto } from './dto/join-course.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StudentGuard } from 'src/auth/guards/student.guard';

@Controller('courses')

export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @UseGuards(TeacherGuard)
  @Post()
  @ApiBearerAuth()
  create(@Body() createCourseDto: CreateCourseDto, @GetUser() teacher: Teacher) {
    return this.coursesService.create(createCourseDto, teacher);
  }
  @UseGuards(TeacherGuard)
  @Get('my-courses')
  @ApiBearerAuth()
  async findAllByTeacher(@GetUser() teacher: Teacher) {
    return this.coursesService.findAllByTeacher(teacher);
  }

  @UseGuards(TeacherGuard)
  @Delete(':id') //(//change to patch)
  @ApiBearerAuth()
  archive(@Param('id', ParseIntPipe) id: number, @GetUser() teacher: Teacher) {
    return this.coursesService.archive(id, teacher);
  }


  @UseGuards(StudentGuard)
  @Post('join')
  @ApiBearerAuth()
  async joinCourse(
    @Body() joinCourseDto: JoinCourseDto,
    @GetUser() student: Student,
  ) {
    return this.coursesService.joinCourseByCode(joinCourseDto.code, student);
  }

  @Get(':id/students')
  @ApiBearerAuth()
  async getCourseStudents(
    @Param('id', ParseIntPipe) courseId: number,
    @GetUser() user: User // Récupérez l'utilisateur connecté (Teacher ou Student)
  ) {
    return this.coursesService.getCourseStudents(courseId, user);
  }


  @UseGuards(StudentGuard)
  @Get('my-enrolled-courses')
  @ApiBearerAuth()
  async getEnrolledCourses(@GetUser() student: Student) {
    return this.coursesService.findStudentCourses(student);
  }
}


