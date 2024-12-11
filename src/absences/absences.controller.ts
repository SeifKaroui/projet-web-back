// absences.controller.ts
import { Controller, Post, Body, Param, Patch, Delete, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { DeleteAbsenceDto } from './dto/delete-absence.dto';
import { GetAbsencesByTeacherDto } from './dto/get-absences-by-teacher.dto';
import { Absence } from './entities/absence.entity';
import { TeacherGuard } from './guard/teacher.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetAbsencesByStudentDto } from './dto/get-absences-by-student.dto';

@Controller('absences')
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  // for teacher
  @Post('teacher/')
  async createAbsence(@Body() createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    return this.absencesService.createAbsence(createAbsenceDto);
  }

  //for teacher
  @Patch('teacher/:absenceId/justify')
  async justifyAbsence(
    @Param('absenceId',ParseIntPipe) absenceId: number,  
    @Body() updateAbsenceDto: UpdateAbsenceDto, 
  ) {
    return this.absencesService.justifyAbsence(absenceId, updateAbsenceDto);
  }

  // for teacher
  @Delete('teacher/:absenceId')
  async deleteAbsence(
    @Param('absenceId',ParseIntPipe) absenceId: number, 
  ) {
    return this.absencesService.softDelete(absenceId);
  }

  // for student 
  @Get('student/absence-course/:studentId')
  async getAbsencesForCurrentStudent(
        @Param("studentId") studentId : string,
        @Query() GetAbsencesByStudentDto : GetAbsencesByStudentDto,
    ): Promise<Absence[]> {
    return this.absencesService.getAbsencesForCurrentStudent(studentId,GetAbsencesByStudentDto);
  }

  //for student 
  @Get('student/absence-count-all-courses/:studentId')
  async AbsenceCount(
    @Param('studentId') studentId: string , // ID de l'étudiant dans le body
  ) {
    return this.absencesService.AbsenceCount(studentId);
  }

  //for student 
  @Get('student/absence-count-course/:studentId')
  async getAbsenceCountForStudent(
    @Param("studentId") studentId : string,
    @Query() GetAbsencesByStudentDto: GetAbsencesByStudentDto, // ID de l'étudiant et du cours dans le body
  ) {
    return this.absencesService.getAbsenceCountForStudent(studentId,GetAbsencesByStudentDto);
  }

  //for teacher
  @Get('teacher/absence-list/:teacherId')
  async getAbsencesForClassAndTeacher(
    @Query() GetAbsencesByTeacherDto: GetAbsencesByTeacherDto,
    @Param("teacherId") teacherId : string,
  ) {
    return this.absencesService.getAbsencesForClassAndTeacher(teacherId, GetAbsencesByTeacherDto);
  }

  // for teacher 
  @Get('teacher/count-absence-list/:teacherId')
  async getAbsenceCountsByCourseAndTeacher(
    @Param('teacherId') teacherId: string, 
    @Query() getAbsencesByTeacherDto: GetAbsencesByTeacherDto,
  ): Promise<any> {
    return this.absencesService.getAbsenceCountsByCourseAndTeacher(teacherId, getAbsencesByTeacherDto);
  }
}
