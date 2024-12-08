import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsBoolean, IsInt } from 'class-validator';

export class CreateAbsenceDto {

  @IsUUID()
  studentId: string; 


  @IsInt()
  courseId: number; 


  @IsDateString()
  date: string; 
  

  @IsBoolean()
  justified: boolean;
}
