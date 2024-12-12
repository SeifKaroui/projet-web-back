// absences.controller.ts
import { Controller, Post, Body, Param, Patch, Delete, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { GetAbsencesByTeacherDto } from './dto/get-absences-by-teacher.dto';
import { Absence } from './entities/absence.entity';
import { TeacherGuard } from './guard/teacher.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAbsencesByStudentDto } from './dto/get-absences-by-student.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { StudentGuard } from './guard/student.guard';
import { ValidateAbsenceDto } from './dto/validate-absence.dto';

@ApiBearerAuth()
@Controller('absences')
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  // for teacher
  @Post('teacher/')
  @UseGuards(TeacherGuard) 
  async createAbsence(
    @Body() createAbsenceDto: CreateAbsenceDto,
    @GetUser() user: any,): Promise<Absence> {
    return this.absencesService.createAbsence(createAbsenceDto,user.id);
  }

  // for teacher
  @Patch('teacher/:absenceId/validate')
  @UseGuards(TeacherGuard) 
  async validate(
    @Param('absenceId', ParseIntPipe) absenceId: number,  
    @Body() ValidateAbsenceDto: ValidateAbsenceDto,
    @GetUser() user: any,
  ) {
    return this.absencesService.validateAbsence(user.id,absenceId, ValidateAbsenceDto);
  }

  // for student 
  @Patch('student/:absenceId/justify')
  @UseGuards(StudentGuard) 
  async justifyAbsence(
    @Param('absenceId', ParseIntPipe) absenceId: number,  
    @Body() updateAbsenceDto: UpdateAbsenceDto,
    @GetUser() user: any,
  ) {
    console.log('User in justifyAbsence:', user);
    return this.absencesService.justifyAbsence(user.id,absenceId, updateAbsenceDto);
  }

  // for teacher
  @Delete('teacher/:absenceId')
  @UseGuards(TeacherGuard) 
  async deleteAbsence(
    @Param('absenceId', ParseIntPipe) absenceId: number,
    @GetUser() user: any,
  ) {
    return this.absencesService.deleteAbsence(user.id,absenceId);
  }
  
  // for student 
  @UseGuards(StudentGuard) 
  @Get('student/absence-course')
  async getAbsencesForCurrentStudent(
    @GetUser() user: any,
    @Query() GetAbsencesByStudentDto: GetAbsencesByStudentDto,
  ): Promise<Absence[]> {
    return this.absencesService.getAbsencesForCurrentStudent(user.id, GetAbsencesByStudentDto);
  }

  // for student 
  @UseGuards(StudentGuard) 
  @Get('student/absence-count-all-courses')
  async AbsenceCount(
    @GetUser() user: any,
  ) {
    return this.absencesService.AbsenceCount(user.id);
  }

  // for student 
  @UseGuards(StudentGuard)
  @Get('student/absence-count-course')
  async getAbsenceCountForStudent(
    @GetUser() user: any,
    @Query() GetAbsencesByStudentDto: GetAbsencesByStudentDto,  // ID de l'étudiant et du cours dans le body
  ) {
    return this.absencesService.getAbsenceCountForStudent(user.id, GetAbsencesByStudentDto);
  }

  // for teacher
  @Get('teacher/absence-list')
  @UseGuards(TeacherGuard) 
  async getAbsencesForClassAndTeacher(
    @Query() GetAbsencesByTeacherDto: GetAbsencesByTeacherDto,
    @GetUser() user: any,
  ) {
    return this.absencesService.getAbsencesForClassAndTeacher(user.id, GetAbsencesByTeacherDto);
  }

  // for teacher 
  @Get('teacher/count-absence-list')
  @UseGuards(TeacherGuard) 
  async getAbsenceCountsByCourseAndTeacher(
    @GetUser() user: any,
    @Query() getAbsencesByTeacherDto: GetAbsencesByTeacherDto,
  ): Promise<any> {
    return this.absencesService.getAbsenceCountsByCourseAndTeacher(user.id, getAbsencesByTeacherDto);
  }
}
