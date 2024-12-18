import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsBoolean, IsInt, IsString, IsOptional } from 'class-validator';
//dto
export class CreateAbsenceDto {

  @IsUUID()
  studentId: string; 


  @IsInt()
  courseId: number; 


  @IsDateString()
  date: string; 
  

  @IsBoolean()
  justified: boolean;

  @IsString()
  @IsOptional()
  justification: string; 
}
