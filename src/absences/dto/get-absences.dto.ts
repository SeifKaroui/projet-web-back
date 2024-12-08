import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, IsDateString, IsInt } from 'class-validator';

export class GetAbsencesDto {
  @IsOptional()
  @IsUUID()
  studentId?: string; 

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  courseId?: number;


  @IsOptional()
  @IsDateString()
  startDate?: string; 
  

  @IsOptional()
  @IsDateString()
  endDate?: string; 
}
