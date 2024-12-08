// absences.controller.ts
import { Controller, Post, Body, Param, Patch, Delete, Get, Query } from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { DeleteAbsenceDto } from './dto/delete-absence.dto';
import { GetAbsencesDto } from './dto/get-absences.dto';
import { Absence } from './entities/absence.entity';

@Controller('absences')
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Post()
  async createAbsence(@Body() createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    return this.absencesService.createAbsence(createAbsenceDto);
  }

  @Patch(':absenceId/justify')
  async justifyAbsence(
    @Param('absenceId') absenceId: string,  
    @Body() updateAbsenceDto: UpdateAbsenceDto, 
  ) {
    return this.absencesService.justifyAbsence(+absenceId, updateAbsenceDto);
  }

  @Delete(':absenceId')
  async deleteAbsence(
    @Param('absenceId') absenceId: string, // Absence ID de type number
    @Body() deleteAbsenceDto: DeleteAbsenceDto,  
  ) {
    deleteAbsenceDto.absenceId = +absenceId; // Lier l'ID à l'objet DTO
    return this.absencesService.deleteAbsence(deleteAbsenceDto);
  }

  @Get()
  async getAbsences(
    @Query() getAbsencesDto: GetAbsencesDto,
  ) {
    return this.absencesService.getAbsences(getAbsencesDto);
  }

  @Get(':studentId')
  async updateAbsenceCount(
    @Param('studentId') studentId: string,
  ) {
    return this.absencesService.updateAbsenceCount(studentId);
  }
}
