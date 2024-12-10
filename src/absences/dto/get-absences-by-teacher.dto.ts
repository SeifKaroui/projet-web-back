import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, IsDateString, IsInt } from 'class-validator';

export class GetAbsencesByTeacherDto {
  
  @Type(() => Number)
  @IsInt()
  courseId?: number;

}
